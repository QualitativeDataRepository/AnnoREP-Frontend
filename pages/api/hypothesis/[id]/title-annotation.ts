import { NextApiRequest, NextApiResponse } from "next"
import { getSession } from "next-auth/client"

import { axiosClient } from "../../../../features/app"

import { REQUEST_DESC_HEADER_NAME } from "../../../../constants/http"
import { getResponseFromError } from "../../../../utils/httpRequestUtils"
import { DATAVERSE_HEADER_NAME } from "../../../../constants/dataverse"

export default async function handler(req: NextApiRequest, res: NextApiResponse): Promise<void> {
  if (req.method === "POST") {
    const session = await getSession({ req })
    if (session) {
      const { id } = req.query
      const { destinationUrl, destinationHypothesisGroup, privateAnnotation, manuscriptId } =
        req.body
      const { dataverseApiToken, hypothesisApiToken, hypothesisUserId } = session
      const requestDesc = `Getting the total number of annotations for data project ${id}`
      try {
        //get title ann
        const titleAnnResponse = await axiosClient.get(
          `${process.env.ARCORE_SERVER_URL}/api/documents/${manuscriptId}/titleann`,
          {
            headers: {
              [DATAVERSE_HEADER_NAME]: dataverseApiToken,
              [REQUEST_DESC_HEADER_NAME]: `Getting title annotation from source manuscript ${manuscriptId}`,
            },
          }
        )
        //send title ann
        const annotation = titleAnnResponse.data
        annotation.target.forEach((element: any) => {
          element.source = destinationUrl
        })
        let newReadPermission = [hypothesisUserId]
        if (!privateAnnotation) {
          newReadPermission = [`group:${destinationHypothesisGroup}`]
        }
        await axiosClient.post(
          `${process.env.HYPOTHESIS_SERVER_URL}/api/annotations`,
          JSON.stringify({
            uri: destinationUrl,
            document: annotation.document,
            //assume text already has the QDR header
            text: annotation.text,
            //tags: annotation.tags,
            target: annotation.target,
            group: destinationHypothesisGroup,
            //TODO: need to test
            permissions: { read: newReadPermission },
          }),
          {
            headers: {
              Authorization: `Bearer ${hypothesisApiToken}`,
              "Content-type": "application/json",
              [REQUEST_DESC_HEADER_NAME]: `Sending title annotation from source manuscript ${manuscriptId} to Hypothes.is server`,
            },
          }
        )
        res.status(200)
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
