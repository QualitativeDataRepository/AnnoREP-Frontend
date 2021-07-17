import axios from "axios"
import { NextApiRequest, NextApiResponse } from "next"
import { getSession } from "next-auth/client"

import {
  ANNOREP_METADATA_FIELD,
  ANNOREP_METADATA_VALUE,
  DATAVERSE_HEADER_NAME,
} from "../../../../../constants/dataverse"
import { getResponseFromError } from "../../../../../utils/httpRequestUtils"

export default async function handler(req: NextApiRequest, res: NextApiResponse) {
  if (req.method === "PUT") {
    const session = await getSession({ req })
    if (session) {
      const { id } = req.query
      try {
        const { status, data } = await axios({
          method: "PUT",
          url: `${process.env.DATAVERSE_SERVER_URL}/api/datasets/${id}/metadata`,
          params: {
            replace: true,
          },
          data: {
            [ANNOREP_METADATA_FIELD]: ANNOREP_METADATA_VALUE,
          },
          headers: {
            "Content-type": "application/ld+json", //TODO: this is right?
            [DATAVERSE_HEADER_NAME]: session.dataverseApiToken,
          },
        })
        res.status(status).json(data)
      } catch (e) {
        const { status, message } = getResponseFromError(
          e,
          `Adding ${ANNOREP_METADATA_VALUE} metadata to dataset ${id}`
        )
        res.status(status).json({ message })
      }
    } else {
      res.status(401).json({ message: "Unauthorized. Please login." })
    }
  } else {
    res.status(405).json({ message: `${req.method} method is not allowed.` })
  }
}
