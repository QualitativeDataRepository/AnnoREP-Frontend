import { AxiosPromise } from "axios"
import { NextApiRequest, NextApiResponse } from "next"
import { getSession } from "next-auth/client"

import { axiosClient } from "../../../../features/app"

import { REQUEST_DESC_HEADER_NAME } from "../../../../constants/http"
import { getResponseFromError } from "../../../../utils/httpRequestUtils"

export default async function handler(req: NextApiRequest, res: NextApiResponse): Promise<void> {
  if (req.method === "POST") {
    const session = await getSession({ req })
    if (session) {
      const {
        destinationUrl: url,
        isAdminAuthor,
        annotations,
        destinationHypothesisGroup,
        privateAnnotation,
      } = req.body
      const requestDesc = `Exporting annotations to ${url}`
      const { hypothesisApiToken } = session
      try {
        const copyAnns: AxiosPromise<any>[] = annotations.map((annotation: any) => {
          annotation.target.forEach((element: any) => {
            element.source = url
          })
          let newReadPermission = annotation.permissions.read
          if (!privateAnnotation) {
            newReadPermission = [`group:${destinationHypothesisGroup}`]
          }
          return axiosClient({
            method: "POST",
            url: `${process.env.HYPOTHESIS_SERVER_URL}/api/annotations`,
            data: JSON.stringify({
              uri: url,
              //document
              text: annotation.text,
              tags: annotation.tags,
              group: destinationHypothesisGroup,
              permissions: { read: newReadPermission },
              target: annotation.target,
              //references
            }),
            headers: {
              Authorization: `Bearer ${
                isAdminAuthor ? process.env.ADMIN_HYPOTHESIS_API_TOKEN : hypothesisApiToken
              }`,
              "Content-type": "application/json",
              [REQUEST_DESC_HEADER_NAME]: requestDesc,
            },
          })
        })
        await Promise.all(copyAnns)
        res.status(200).json({
          totalExported: annotations.length,
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
