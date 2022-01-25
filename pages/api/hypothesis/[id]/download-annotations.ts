import axios from "axios"
import { NextApiRequest, NextApiResponse } from "next"
import { getSession } from "next-auth/client"

import { AtiTab } from "../../../../constants/ati"
import { REQUEST_DESC_HEADER_NAME } from "../../../../constants/http"
import { range } from "../../../../utils/arrayUtils"
import { getResponseFromError } from "../../../../utils/httpRequestUtils"

const ANNOTATIONS_MAX_LIMIT = 200

export default async function handler(req: NextApiRequest, res: NextApiResponse): Promise<void> {
  if (req.method === "GET") {
    const session = await getSession({ req })
    if (session) {
      const { id, hypothesisGroup } = req.query
      const uri = `${process.env.NEXTAUTH_URL}/ati/${id}/${AtiTab.manuscript.id}`
      const searchEndpoint = `${process.env.HYPOTHESIS_SERVER_URL}/api/search`
      const { hypothesisApiToken } = session
      const requestDesc = `Getting annotations from Hypothes.is server for dataset ${id}`
      await axios
        //Get the total annotations
        .get(searchEndpoint, {
          params: {
            limit: 1,
            group: hypothesisGroup,
            uri,
          },
          headers: {
            Authorization: `Bearer ${hypothesisApiToken}`,
            Accept: "application/json",
            [REQUEST_DESC_HEADER_NAME]: requestDesc,
          },
        })
        //Get the annotations in parallel
        .then(({ data }) => {
          const offsets = range(0, data.total - 1, ANNOTATIONS_MAX_LIMIT)
          return Promise.all(
            offsets.map((offset) => {
              return axios.get(searchEndpoint, {
                params: {
                  limit: ANNOTATIONS_MAX_LIMIT,
                  group: hypothesisGroup,
                  uri,
                  offset,
                },
                headers: {
                  Authorization: `Bearer ${hypothesisApiToken}`,
                  Accept: "application/json",
                  [REQUEST_DESC_HEADER_NAME]: requestDesc,
                },
              })
            })
          )
        })
        .then((axiosResponses) => {
          //Merge all the data.rows
          const allRows = axiosResponses.map(({ data }) => data.rows)
          const annotations = [].concat(...allRows) as any[]
          const exactMatches = annotations.filter((annotation) => annotation.uri === uri)
          res.status(200).json({
            annotations: exactMatches,
            total: exactMatches.length,
          })
        })
        .catch((e) => {
          const { status, message } = getResponseFromError(e, requestDesc)
          console.error(status, message)
          res.status(status).json({ message })
        })
    } else {
      res.status(401).json({ message: "Unauthorized! Please login." })
    }
  } else {
    res.status(405).json({ message: `${req.method} method is not allowed.` })
  }
}
