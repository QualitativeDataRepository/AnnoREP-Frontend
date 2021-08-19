import axios, { AxiosPromise } from "axios"
import { NextApiRequest, NextApiResponse } from "next"
import { getSession } from "next-auth/client"

import { AtiTab } from "../../../../constants/ati"
import { DATAVERSE_HEADER_NAME } from "../../../../constants/dataverse"
import { REQUEST_DESC_HEADER_NAME } from "../../../../constants/http"
import { getResponseFromError } from "../../../../utils/httpRequestUtils"

export default async function handler(req: NextApiRequest, res: NextApiResponse) {
  const { datasetId, isRevision } = req.query
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
          if (isRevision !== "true") {
            //Uploading revised manuscript, donn't send annotations
            const uri = `${process.env.NEXTAUTH_URL}/ati/${datasetId}?atiTab=${AtiTab.manuscript.id}`
            const sendAnns: AxiosPromise<any>[] = data.map((annotation: any) => {
              annotation.target.forEach((element: any) => {
                element.source = uri
              })
              return axios({
                method: "POST",
                url: `${process.env.HYPOTHESIS_SERVER_URL}/api/annotations`,
                data: JSON.stringify({
                  uri: uri,
                  document: annotation.document,
                  text: annotation.text,
                  target: annotation.target,
                }),
                headers: {
                  Authorization: `Bearer ${hypothesisApiToken}`,
                  "Content-type": "application/json",
                  [REQUEST_DESC_HEADER_NAME]: `Sending annotations from source manuscript ${id} to Hypothes.is server`,
                },
              })
            })
            return Promise.all(sendAnns)
          }
        })
        .then(() => {
          res.status(200).json({ manuscriptId: id })
        })
        .catch((e) => {
          const { status, message } = getResponseFromError(
            e,
            `Extracting annotations from source manuscript ${id} and sending annotations to Hypothes.is server`
          )
          console.error(status, message)
          res.status(status).json({ message })
        })
    } else {
      res.status(401).json({ message: "Unauthorized. Please login. " })
    }
  } else {
    res.status(405).json({ message: `${req.method} method is not allowed.` })
  }
}
