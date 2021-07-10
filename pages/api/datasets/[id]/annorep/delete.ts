import axios from "axios"
import { NextApiRequest, NextApiResponse } from "next"
import { getSession } from "next-auth/client"

import {
  ANNOREP_METADATA_FIELD,
  ANNOREP_METADATA_VALUE,
  DATAVERSE_HEADER_NAME,
} from "../../../../../constants/dataverse"

export default async function handler(req: NextApiRequest, res: NextApiResponse) {
  if (req.method === "PUT") {
    const session = await getSession({ req })
    if (session) {
      const { id } = req.query
      try {
        const { status, data } = await axios({
          method: "PUT",
          url: `${session.serverUrl}/api/datasets/${id}/metadata/delete`,
          data: {
            [ANNOREP_METADATA_FIELD]: ANNOREP_METADATA_VALUE,
          },
          headers: {
            "Content-type": "application/ld+json", //TODO: this is right?
            [DATAVERSE_HEADER_NAME]: session.apiToken,
          },
        })
        res.status(status).json(data)
      } catch (e) {
        res.status(400).json({
          msg: `Failed to delete ${ANNOREP_METADATA_VALUE} metadata from dataset ${id}. Error: ${e}`,
        })
      }
    } else {
      res.status(401).json({ msg: "Unauthorized. Please login." })
    }
  } else {
    res.status(405).json({ msg: `${req.method} method is not allowed.` })
  }
}
