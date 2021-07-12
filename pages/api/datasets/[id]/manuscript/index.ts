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

export default async function handler(req: NextApiRequest, res: NextApiResponse) {
  if (req.method === "PUT") {
    const session = await getSession({ req })
    if (session) {
      const { id } = req.query
      const { dataverseApiToken } = session
      const form = formidable({ multiples: true })
      form.parse(req, async (err, _, files) => {
        const manuscript = files.manuscript as formidable.File
        if (err) {
          res.status(400).json({ msg: `Failed to parse manuscript file. Error: ${err}` })
        }

        try {
          const addManuscriptForm = new FormData()
          //addManuscriptForm.append("file", manuscript, manuscript.name as string)
          //addManuscriptForm.append("file", Buffer.from(JSON.stringify(manuscript.toJSON())))
          addManuscriptForm.append(
            "file",
            fs.createReadStream((manuscript as formidable.File).path)
          )
          addManuscriptForm.append(
            "jsonData",
            JSON.stringify({
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
              "Content-Type": "multipart/form-data",
              [DATAVERSE_HEADER_NAME]: dataverseApiToken,
            },
          })
          res.status(status).json(data)
        } catch (e) {
          res.status(400).json({
            msg: `Failed to add manuscript to dataset ${id}. Error: ${e}`,
          })
        }
      })
    } else {
      res.status(401).json({ msg: "Unauthorized. Please login." })
    }
  } else {
    res.status(405).json({ msg: `${req.method} method is not allowed.` })
  }
}
