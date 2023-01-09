import { NextApiRequest, NextApiResponse } from "next"
import { getSession } from "next-auth/client"

import { axiosClient } from "../../../../features/app"

import { REQUEST_DESC_HEADER_NAME } from "../../../../constants/http"
import { getResponseFromError } from "../../../../utils/httpRequestUtils"

export default async function handler(req: NextApiRequest, res: NextApiResponse): Promise<void> {
  if (req.method === "POST") {
    const session = await getSession({ req })
    if (session) {
      const { newAnnotations, isAdminAuthor } = req.body
      const destinationUrl = newAnnotations[0].data.uri
      const requestDesc = `Exporting annotations to ${destinationUrl}`
      const exportApiUrl = `${process.env.HYPOTHESIS_SERVER_URL}/api/annotations`
      const { hypothesisApiToken } = session

      const exportApiToken = isAdminAuthor
        ? process.env.ADMIN_HYPOTHESIS_API_TOKEN
        : hypothesisApiToken

      try {
        //only ever send 30 annotations
        await Promise.all(
          newAnnotations.map((annotation: any) => {
            return axiosClient.post(exportApiUrl, JSON.stringify(annotation.data), {
              headers: {
                Authorization: `Bearer ${exportApiToken}`,
                "Content-type": "application/json",
                [REQUEST_DESC_HEADER_NAME]: `Exporting annotation ${annotation.sourceId} to ${destinationUrl}`,
              },
            })
          })
        )
        res.status(200).send({ total: newAnnotations.length })
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
