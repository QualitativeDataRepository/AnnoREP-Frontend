import { NextApiRequest, NextApiResponse } from "next"
import { getSession } from "next-auth/client"

import { axiosClient } from "../../../../features/app"

import { AtiTab } from "../../../../constants/ati"
import { REQUEST_DESC_HEADER_NAME } from "../../../../constants/http"
import { getResponseFromError } from "../../../../utils/httpRequestUtils"

const ADMIN_HYPOTHESIS_API_TOKEN = process.env.ADMIN_HYPOTHESIS_API_TOKEN

export default async function handler(req: NextApiRequest, res: NextApiResponse): Promise<void> {
  if (req.method === "GET") {
    const session = await getSession({ req })
    if (session) {
      const { id, hypothesisGroup, isAdminDownloader } = req.query
      const uri = `${process.env.NEXTAUTH_URL}/ati/${id}/${AtiTab.manuscript.id}`
      const searchEndpoint = `${process.env.HYPOTHESIS_SERVER_URL}/api/search`
      const { hypothesisApiToken: userHypothesisApiToken } = session
      const hypothesisApiToken =
        isAdminDownloader === "true" ? ADMIN_HYPOTHESIS_API_TOKEN : userHypothesisApiToken
      const requestDesc = `Getting the total number of annotations for data project ${id}`
      try {
        const params: Record<string, any> = { uri, limit: 1 }
        if (hypothesisGroup !== undefined && hypothesisGroup.length > 0) {
          params["group"] = hypothesisGroup
        }
        const { data } = await axiosClient.get(searchEndpoint, {
          params,
          headers: {
            Authorization: `Bearer ${hypothesisApiToken}`,
            Accept: "application/json",
            [REQUEST_DESC_HEADER_NAME]: requestDesc,
          },
        })
        res.status(200).json({ total: data.total })
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
