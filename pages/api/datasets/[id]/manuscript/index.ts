import axios from "axios"
import formidable from "formidable"
import FormData from "form-data"
import fs from "fs"
import { NextApiRequest, NextApiResponse } from "next"
import { getSession } from "next-auth/client"

import {
  ANNOREP_METADATA_VALUE,
  DATAVERSE_HEADER_NAME,
  SOURCE_MANUSCRIPT_TAG,
} from "../../../../../constants/dataverse"
import { REQUEST_DESC_HEADER_NAME } from "../../../../../constants/http"
import { getResponseFromError } from "../../../../../utils/httpRequestUtils"

export const config = {
  api: {
    bodyParser: false,
  },
}

export default async function handler(req: NextApiRequest, res: NextApiResponse) {
  if (req.method === "POST") {
    const session = await getSession({ req })
    if (session) {
      const { id } = req.query
      const { dataverseApiToken } = session
      const requestDesc = `Adding manuscript to dataset ${id}`
      const form = formidable({ multiples: false })
      form.parse(req, async (err, _, files) => {
        const manuscript = files.manuscript as formidable.File
        if (err) {
          res.status(400).json({ message: `Failed to parse form data. ${err}` })
        }

        try {
          const addManuscriptForm = new FormData()
          addManuscriptForm.append("file", fs.createReadStream(manuscript.path), {
            filename: manuscript.name as string,
            contentType: manuscript.type as string,
          })
          addManuscriptForm.append(
            "jsonData",
            JSON.stringify({
              mimeType: manuscript.type,
              label: manuscript.name,
              description: SOURCE_MANUSCRIPT_TAG,
              directoryLabel: `${ANNOREP_METADATA_VALUE}`,
              categories: [SOURCE_MANUSCRIPT_TAG],
              restrict: true,
            })
          )
          const { status, data } = await axios({
            method: "POST",
            url: `${process.env.DATAVERSE_SERVER_URL}/api/datasets/${id}/add`,
            data: addManuscriptForm,
            headers: {
              "Content-Type": `${addManuscriptForm.getHeaders()["content-type"]}`,
              [DATAVERSE_HEADER_NAME]: dataverseApiToken,
              [REQUEST_DESC_HEADER_NAME]: requestDesc,
            },
          })
          res.status(status).json(data)
        } catch (e) {
          const { status, message } = getResponseFromError(e, requestDesc)
          console.error(status, message)
          res.status(status).json({ message })
        }
      })
    } else {
      res.status(401).json({ message: "Unauthorized. Please login." })
    }
  } else {
    res.status(405).json({ message: `${req.method} method is not allowed.` })
  }
}
