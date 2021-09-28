import axios from "axios"
import { NextApiRequest, NextApiResponse } from "next"
import { getSession } from "next-auth/client"

import {
  ANNOREP_METADATA_FIELD,
  ANNOREP_METADATA_VALUE,
  DATAVERSE_HEADER_NAME,
} from "../../../../../constants/dataverse"
import { REQUEST_DESC_HEADER_NAME } from "../../../../../constants/http"
import { getResponseFromError } from "../../../../../utils/httpRequestUtils"

export default async function handler(req: NextApiRequest, res: NextApiResponse) {
  if (req.method === "PUT") {
    const session = await getSession({ req })
    if (session) {
      const { id } = req.query
      const requestDesc = `Adding ${ANNOREP_METADATA_VALUE} metadata to dataset ${id}`
      try {
        const { status, data } = await axios({
          method: "PUT",
          url: `${process.env.DATAVERSE_SERVER_URL}/api/datasets/${id}/metadata`,
          params: {
            replace: true,
          },
          data: JSON.stringify({
            [ANNOREP_METADATA_FIELD]: ANNOREP_METADATA_VALUE,
          }),
          headers: {
            "Content-type": "application/json-ld", //TODO: change ld+json?
            [DATAVERSE_HEADER_NAME]: session.dataverseApiToken,
            [REQUEST_DESC_HEADER_NAME]: requestDesc,
          },
        })
        res.status(status).json(data)
      } catch (e) {
        const { status, message } = getResponseFromError(e, requestDesc)
        console.error(status, message)
        res.status(status).json({ message })
      }
    } else {
      res.status(401).json({ message: "Unauthorized. Please login." })
    }
  } else {
    res.status(405).json({ message: `${req.method} method is not allowed.` })
  }
}
