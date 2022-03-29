import { NextApiRequest, NextApiResponse } from "next"
import { getSession } from "next-auth/client"

import { axiosClient } from "../../../../features/app"

import { DATAVERSE_HEADER_NAME } from "../../../../constants/dataverse"
import { REQUEST_DESC_HEADER_NAME } from "../../../../constants/http"
import { getResponseFromError } from "../../../../utils/httpRequestUtils"

export default async function handler(req: NextApiRequest, res: NextApiResponse): Promise<void> {
  if (req.method === "POST") {
    const session = await getSession({ req })
    if (session) {
      const { id } = req.query
      const requestDesc = `Submitting data project ${id} for review`
      try {
        const { status, data } = await axiosClient({
          method: "POST",
          url: `${process.env.DATAVERSE_SERVER_URL}/api/datasets/${id}/submitForReview`,
          headers: {
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
