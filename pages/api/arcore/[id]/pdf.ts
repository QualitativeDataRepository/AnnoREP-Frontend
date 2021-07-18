import axios from "axios"
import { NextApiRequest, NextApiResponse } from "next"
import { getSession } from "next-auth/client"

import { DATAVERSE_HEADER_NAME } from "../../../../constants/dataverse"
import { getResponseFromError } from "../../../../utils/httpRequestUtils"

export default async function handler(req: NextApiRequest, res: NextApiResponse) {
  if (req.method === "PUT") {
    const session = await getSession({ req })
    if (session) {
      const { id } = req.query
      const { dataverseApiToken } = session
      try {
        const { status, data } = await axios.get(
          `${process.env.ARCORE_SERVER_URL}/api/documents/${id}/pdf`,
          {
            responseType: "arraybuffer",
            headers: {
              [DATAVERSE_HEADER_NAME]: dataverseApiToken,
              Accept: "application/pdf",
            },
          }
        )
        res.status(status).json({ file: data })
      } catch (e) {
        const { status, message } = getResponseFromError(e, "Getting manuscript PDF file")
        res.status(status).json({ message })
      }
    } else {
      res.status(401).json({ message: "Unauthorized. Please login. " })
    }
  } else {
    res.status(405).json({ message: `${req.method} method is not allowed.` })
  }
}
