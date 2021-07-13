import axios, { AxiosPromise } from "axios"
import { NextApiRequest, NextApiResponse } from "next"
import { getSession } from "next-auth/client"

import { DATAVERSE_HEADER_NAME } from "../../../constants/dataverse"
import { errorWrapper, requestWrapper } from "../../../utils/httpRequestUtils"

const FAILURE_MSGS = [
  "Unable to create manuscript PDF and annotation files",
  "Unable to get annotation JSON file",
  "Unable to send annotation to Hypothesis server",
]

export default async function handler(req: NextApiRequest, res: NextApiResponse) {
  if (req.method === "PUT") {
    const session = await getSession({ req })
    if (session) {
      const { id } = req.query
      const { dataverseApiToken, hypothesisApiToken } = session
      const createPdfAnn = axios({
        method: "PUT",
        url: `${process.env.ARCORE_SERVER_URL}/api/documents/${id}`,
        headers: {
          [DATAVERSE_HEADER_NAME]: dataverseApiToken,
        },
      })
      createPdfAnn
        .then(({ status }) => {
          const getAnn = axios({
            method: "GET",
            url: `${process.env.ARCORE_SERVER_URL}/api/documents/${id}/ann`,
            headers: {
              [DATAVERSE_HEADER_NAME]: dataverseApiToken,
            },
          })
          return requestWrapper(200, status, getAnn, FAILURE_MSGS[0])
        }, errorWrapper(FAILURE_MSGS[0]))
        .then(({ status, data }) => {
          const sendAnns: AxiosPromise<any>[] = data.map((annotation: any) => {
            return axios({
              method: "POST",
              url: `${process.env.HYPOTHESIS_SERVER_URL}/api/annotations`,
              data: JSON.stringify({
                ...annotation,
                uri: `${process.env.NEXTAUTH_URL}/manuscript/${id}`,
              }),
              headers: {
                Authorization: `Bearer ${hypothesisApiToken}`,
                "Content-type": "application/json",
              },
            })
          })
          const sendAllAnns = Promise.all(sendAnns)
          return requestWrapper(200, status, sendAllAnns, FAILURE_MSGS[1])
        }, errorWrapper(FAILURE_MSGS[1]))
        .then((sendAllAnnsResult) => {
          const data = []
          for (let i = 0; i < sendAllAnnsResult.length; i++) {
            if (sendAllAnnsResult[i].status !== 200) {
              throw new Error(`Request status: ${sendAllAnnsResult[i].status}. ${FAILURE_MSGS[2]}.`)
            } else {
              data.push(sendAllAnnsResult[i].data)
            }
          }
          res.status(200).json(data)
        }, errorWrapper(FAILURE_MSGS[2]))
        .catch((e) => {
          res.status(400).json(e)
        })
    } else {
      res.status(401).json({ msg: "Unauthorized. Please login. " })
    }
  } else {
    res.status(405).json({ msg: `${req.method} method is not allowed.` })
  }
}
