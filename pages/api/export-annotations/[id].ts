import axios, { AxiosPromise } from "axios"
import { NextApiRequest, NextApiResponse } from "next"
import { getSession } from "next-auth/client"

import { REQUEST_DESC_HEADER_NAME } from "../../../constants/http"
import { getResponseFromError } from "../../../utils/httpRequestUtils"

const ANNOTATIONS_MAX_LIMIT = 200

export default async function handler(req: NextApiRequest, res: NextApiResponse) {
  if (req.method === "POST") {
    const session = await getSession({ req })
    if (session) {
      const { id } = req.query
      const { destinationUrl: url } = JSON.parse(req.body)
      const { hypothesisApiToken } = session
      let numAnnotations = 0
      let numAnnotationsCopied = 0
      let hasAnnotations = true
      let searchAfter = ""
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
              [REQUEST_DESC_HEADER_NAME]: `Getting annotations from Hypothes.is server for source manuscript ${id}`,
            },
          })
          .then(({ data }) => {
            numAnnotations += data.total
            if (data.total === ANNOTATIONS_MAX_LIMIT) {
              hasAnnotations = true
              searchAfter = data.rows[data.rows.length - 1].updated
            } else {
              hasAnnotations = false
            }
            const copyAnns: AxiosPromise<any>[] = data.rows((annotation: any) => {
              return axios({
                method: "POST",
                url: `${process.env.HYPOTHESIS_SERVER_URL}/api/annotations`,
                data: JSON.stringify({
                  uri: url,
                  //document
                  text: annotation.text,
                  tags: annotation.tags,
                  //group
                  //permissions
                  target: annotation.target,
                  //references
                }),
                headers: {
                  Authorization: `Bearer ${hypothesisApiToken}`,
                  "Content-type": "application/json",
                  [REQUEST_DESC_HEADER_NAME]: `Sending annotations from source manuscript ${id} to ${url}`,
                },
              })
            })
            return Promise.all(copyAnns)
          })
          .then((copyAnnResults) => {
            numAnnotationsCopied += copyAnnResults?.length || 0
          })
          .catch((e) => {
            const { status, message } = getResponseFromError(
              e,
              `Copying annotations from Hypothes.is server to ${url}`
            )
            res.status(status).json({ message })
          })
      }
      res.status(200).json({
        message: `Copied ${numAnnotationsCopied}/${numAnnotations} annotations from source manuscript ${id} to ${url}`,
      })
    } else {
      res.status(401).json({ message: "Unauthorized! Please login." })
    }
  } else {
    res.status(405).json({ message: `${req.method} method is not allowed.` })
  }
}
