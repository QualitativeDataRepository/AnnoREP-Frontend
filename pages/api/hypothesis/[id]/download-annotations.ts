import { NextApiRequest, NextApiResponse } from "next"
import { getSession } from "next-auth/client"

import { axiosClient } from "../../../../features/app"

import { AtiTab } from "../../../../constants/ati"
import { REQUEST_DESC_HEADER_NAME } from "../../../../constants/http"
import { IHypothesisAnnotation } from "../../../../types/hypothesis"
import { getResponseFromError } from "../../../../utils/httpRequestUtils"

const ADMIN_HYPOTHESIS_API_TOKEN = process.env.ADMIN_HYPOTHESIS_API_TOKEN

export default async function handler(req: NextApiRequest, res: NextApiResponse): Promise<void> {
  if (req.method === "GET") {
    const session = await getSession({ req })
    if (session) {
      const { id, isAdminDownloader, sourceHypothesisGroup, sort, order, searchAfter, limit } =
        req.query
      const sourceUrl = `${process.env.NEXTAUTH_URL}/ati/${id}/${AtiTab.manuscript.id}`
      const exportApiUrl = `${process.env.HYPOTHESIS_SERVER_URL}/api/search`
      const { hypothesisApiToken } = session
      const exportApiToken =
        isAdminDownloader === "true" ? ADMIN_HYPOTHESIS_API_TOKEN : hypothesisApiToken
      const requestDesc = `Downloading annotations from Hypothes.is server for data project ${id}`
      try {
        //limit must be less than 200
        const params = {
          uri: sourceUrl,
          sort,
          order,
          search_after: searchAfter,
          limit,
          group: sourceHypothesisGroup,
        }
        const { data } = await axiosClient.get<{ rows: IHypothesisAnnotation[]; total: number }>(
          exportApiUrl,
          {
            params,
            headers: {
              Authorization: `Bearer ${exportApiToken}`,
              Accept: "application/json",
              [REQUEST_DESC_HEADER_NAME]: requestDesc,
            },
          }
        )
        res.status(200).json({
          rows: data.rows,
          tota: data.total,
        })
      } catch (e) {
        const { status, message } = getResponseFromError(e, requestDesc)
        console.error(status, message)
        res.status(status).json({ message })
      }
    } else {
      res.status(401).json({ message: "Unauthorized! Please login." })
    }
  } else {
    res.status(405).json({ message: `${req.method} method is not allowed.` })
  }
}
