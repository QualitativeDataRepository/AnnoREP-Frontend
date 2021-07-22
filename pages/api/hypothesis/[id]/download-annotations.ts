import axios from "axios"
import { NextApiRequest, NextApiResponse } from "next"
import { getSession } from "next-auth/client"

import { REQUEST_DESC_HEADER_NAME } from "../../../../constants/http"
import { getResponseFromError } from "../../../../utils/httpRequestUtils"

const ANNOTATIONS_MAX_LIMIT = 200

export default async function handler(req: NextApiRequest, res: NextApiResponse) {
  if (req.method === "GET") {
    const session = await getSession({ req })
    if (session) {
      const { id } = req.query
      const { hypothesisApiToken } = session
      const requestDesc = `Getting annotations from Hypothes.is server for source manuscript ${id}`
      let hasAnnotations = true
      let searchAfter = ""
      const annotations: any[] = []
      while (hasAnnotations) {
        const params: Record<string, any> = {
          limit: ANNOTATIONS_MAX_LIMIT,
          uri: `${process.env.NEXTAUTH_URL}/manuscript/${id}`,
        }
        if (searchAfter) {
          params["search_after"] = searchAfter
        }
        await axios
          .get(`${process.env.HYPOTHESIS_SERVER_URL}/api/search`, {
            params,
            headers: {
              Authorization: `Bearer ${hypothesisApiToken}`,
              Accept: "application/json",
              [REQUEST_DESC_HEADER_NAME]: requestDesc,
            },
          })
          .then(({ data }) => {
            if (data.total === ANNOTATIONS_MAX_LIMIT) {
              hasAnnotations = true
              searchAfter = data.rows[data.total - 1].updated
            } else {
              hasAnnotations = false
            }
            annotations.push(...data.rows)
          })
          .catch((e) => {
            const { status, message } = getResponseFromError(e, requestDesc)
            res.status(status).json({ message })
          })
      }
      res.status(200).json({
        annotations,
        total: annotations.length,
      })
    } else {
      res.status(401).json({ message: "Unauthorized! Please login." })
    }
  } else {
    res.status(405).json({ message: `${req.method} method is not allowed.` })
  }
}
