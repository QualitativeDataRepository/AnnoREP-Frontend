import { NextApiRequest, NextApiResponse } from "next"
import { getSession } from "next-auth/client"

import { axiosClient } from "../../../../features/app"

import { AtiTab } from "../../../../constants/ati"
import { REQUEST_DESC_HEADER_NAME } from "../../../../constants/http"
import { getResponseFromError } from "../../../../utils/httpRequestUtils"
import { serverExportAnnotations } from "../../../../utils/hypothesisUtils"

export default async function handler(req: NextApiRequest, res: NextApiResponse): Promise<void> {
  if (req.method === "POST") {
    const session = await getSession({ req })
    if (session) {
      const { id } = req.query
      const {
        sourceHypothesisGroup,
        isAdminDownloader,
        destinationUrl,
        destinationHypothesisGroup,
        privateAnnotation,
        numberAnnotations,
        addQdrInfo,
        isAdminAuthor,
      } = req.body
      const requestDesc = `Exporting annotations to ${destinationUrl}`
      const sourceUrl = `${process.env.NEXTAUTH_URL}/ati/${id}/${AtiTab.manuscript.id}`
      const downloadApiUrl = `${process.env.HYPOTHESIS_SERVER_URL}/api/search`
      const { hypothesisApiToken } = session

      const downloadApiToken = isAdminDownloader
        ? process.env.ADMIN_HYPOTHESIS_API_TOKEN
        : hypothesisApiToken
      const exportApiToken = isAdminAuthor
        ? process.env.ADMIN_HYPOTHESIS_API_TOKEN
        : hypothesisApiToken

      try {
        const params = { uri: sourceUrl, limit: 1, group: sourceHypothesisGroup }
        const { data } = await axiosClient.get<{ total: number }>(downloadApiUrl, {
          params,
          headers: {
            Authorization: `Bearer ${downloadApiToken}`,
            Accept: "application/json",
            [REQUEST_DESC_HEADER_NAME]: `Getting total annotations count for ${sourceUrl}`,
          },
        })
        const totalExported = serverExportAnnotations({
          totalAnnotationsCount: data.total,
          downloadApiUrl,
          exportApiUrl: `${process.env.HYPOTHESIS_SERVER_URL}/api/annotations`,
          sourceUrl,
          destinationUrl,
          sourceHypothesisGroup,
          destinationHypothesisGroup,
          downloadApiToken: downloadApiToken as string,
          exportApiToken: exportApiToken as string,
          privateAnnotation,
          addQdrInfo,
          numberAnnotations,
        })
        res.status(200).json({
          total: totalExported,
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
