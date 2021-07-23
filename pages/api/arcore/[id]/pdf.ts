import axios from "axios"
import { NextApiRequest, NextApiResponse } from "next"
import { getSession } from "next-auth/client"

import { DATAVERSE_HEADER_NAME } from "../../../../constants/dataverse"
import { REQUEST_DESC_HEADER_NAME } from "../../../../constants/http"
import { getResponseFromError } from "../../../../utils/httpRequestUtils"

export default async function handler(req: NextApiRequest, res: NextApiResponse) {
  if (req.method === "GET") {
    const session = await getSession({ req })
    if (session) {
      const { id } = req.query
      const { dataverseApiToken } = session
      const requestDesc = `Getting ingest PDF file from source manuscript ${id}`
      try {
        const { status, data } = await axios.get(
          `${process.env.ARCORE_SERVER_URL}/api/documents/${id}/pdf`,
          {
            responseType: "arraybuffer",
            headers: {
              [DATAVERSE_HEADER_NAME]: dataverseApiToken,
              Accept: "application/pdf",
              [REQUEST_DESC_HEADER_NAME]: requestDesc,
            },
          }
        )
        res.status(status).send(data)
      } catch (e) {
        const { status, message } = getResponseFromError(e, requestDesc)
        res.status(status).json({ message })
      }
    } else {
      res.status(401).json({ message: "Unauthorized. Please login. " })
    }
  } else {
    res.status(405).json({ message: `${req.method} method is not allowed.` })
  }
}
