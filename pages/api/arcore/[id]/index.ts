import axios, { AxiosPromise } from "axios"
import { NextApiRequest, NextApiResponse } from "next"
import { getSession } from "next-auth/client"

import { DATAVERSE_HEADER_NAME } from "../../../../constants/dataverse"
import { REQUEST_DESC_HEADER_NAME } from "../../../../constants/http"
import { getResponseFromError } from "../../../../utils/httpRequestUtils"

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
          [REQUEST_DESC_HEADER_NAME]: `Extracting annotations from source manuscript ${id}`,
        },
      })
      await createPdfAnn
        .then(() => {
          return axios({
            method: "GET",
            url: `${process.env.ARCORE_SERVER_URL}/api/documents/${id}/ann`,
            headers: {
              [DATAVERSE_HEADER_NAME]: dataverseApiToken,
              [REQUEST_DESC_HEADER_NAME]: `Getting annotations from source manuscript ${id}`,
            },
          })
        })
        .then(({ data }) => {
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
                [REQUEST_DESC_HEADER_NAME]: `Sending annotations from source manuscript ${id} to Hypothes.is server`,
              },
            })
          })
          return Promise.all(sendAnns)
        })
        .then((sendAllAnnsResult) => {
          res.status(200).json(sendAllAnnsResult)
        })
        .catch((e) => {
          const { status, message } = getResponseFromError(
            e,
            `Extracting annotations from source manuscript ${id} and sending annotations to Hypothes.is server`
          )
          res.status(status).json({ message })
        })
    } else {
      res.status(401).json({ message: "Unauthorized. Please login. " })
    }
  } else {
    res.status(405).json({ message: `${req.method} method is not allowed.` })
  }
}
