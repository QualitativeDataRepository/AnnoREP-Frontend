import { NextApiRequest, NextApiResponse } from "next"
import { getSession } from "next-auth/client"

import { axiosClient } from "../../../../features/app"

import { AtiTab } from "../../../../constants/ati"
import { DATAVERSE_HEADER_NAME } from "../../../../constants/dataverse"
import { REQUEST_BATCH_SIZE } from "../../../../constants/hypothesis"
import { REQUEST_DESC_HEADER_NAME } from "../../../../constants/http"
import { range } from "../../../../utils/arrayUtils"
import { getResponseFromError } from "../../../../utils/httpRequestUtils"

export default async function handler(req: NextApiRequest, res: NextApiResponse): Promise<void> {
  if (req.method === "PUT") {
    const session = await getSession({ req })
    if (session) {
      const { id } = req.query
      const { datasetId, uploadAnnotations } = req.body
      const { dataverseApiToken, hypothesisApiToken } = session
      try {
        await axiosClient.put(`${process.env.ARCORE_SERVER_URL}/api/documents/${id}`, undefined, {
          headers: {
            [DATAVERSE_HEADER_NAME]: dataverseApiToken as string,
            [REQUEST_DESC_HEADER_NAME]: `Creating ingest PDF and extracting annotations from source manuscript ${id}`,
          },
        })
        if (uploadAnnotations) {
          const anns = await axiosClient.get(
            `${process.env.ARCORE_SERVER_URL}/api/documents/${id}/ann`,
            {
              headers: {
                [DATAVERSE_HEADER_NAME]: dataverseApiToken as string,
                [REQUEST_DESC_HEADER_NAME]: `Getting annotations from source manuscript ${id}`,
              },
            }
          )
          const uri = `${process.env.NEXTAUTH_URL}/ati/${datasetId}/${AtiTab.manuscript.id}`
          const batches = range(0, anns.data.length - 1, REQUEST_BATCH_SIZE)
          await batches.reduce((promise, start) => {
            return promise.then(() => {
              const sendAnns = anns.data
                .slice(start, start + REQUEST_BATCH_SIZE)
                .map((annotation: any) => {
                  annotation.target.forEach((element: any) => {
                    element.source = uri
                  })
                  return axiosClient.post(
                    `${process.env.HYPOTHESIS_SERVER_URL}/api/annotations`,
                    JSON.stringify({
                      uri: uri,
                      document: annotation.document,
                      text: annotation.text,
                      //tags
                      //group defaults to public
                      //permissions default to user only
                      target: annotation.target,
                      //references
                    }),
                    {
                      headers: {
                        Authorization: `Bearer ${hypothesisApiToken}`,
                        "Content-Type": "application/json",
                        [REQUEST_DESC_HEADER_NAME]: `Sending annotations from source manuscript ${id} to Hypothes.is server`,
                      },
                    }
                  )
                })
              return Promise.all(sendAnns)
            })
          }, Promise.resolve<any[]>([]))
        }
        res.status(200).json({ manuscriptId: id })
      } catch (e) {
        const { status, message } = getResponseFromError(
          e,
          `Extracting annotations from source manuscript ${id} and sending annotations to Hypothes.is server`
        )
        console.error(status, message)
        res.status(status).json({ message })
      }
    } else {
      res.status(401).json({ message: "Unauthorized. Please login. " })
    }
  } else {
    res.status(405).json({ message: `${req.method} method is not allowed.` })
  }
}
