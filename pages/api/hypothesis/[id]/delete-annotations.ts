import axios, { AxiosPromise } from "axios"
import { NextApiRequest, NextApiResponse } from "next"
import { getSession } from "next-auth/client"

import { REQUEST_DESC_HEADER_NAME } from "../../../../constants/http"
import { getResponseFromError } from "../../../../utils/httpRequestUtils"

export default async function handler(req: NextApiRequest, res: NextApiResponse) {
  if (req.method === "DELETE") {
    const session = await getSession({ req })
    if (session) {
      const { annotations } = req.body
      const requestDesc = `Deleting annotations`
      const { hypothesisApiToken } = session
      try {
        const deleteAnns: AxiosPromise<any>[] = annotations.map((annotation: any) => {
          return axios.delete(
            `${process.env.HYPOTHESIS_SERVER_URL}/api/annotations/${annotation.id}`,
            {
              headers: {
                Authorization: `Bearer ${hypothesisApiToken}`,
                [REQUEST_DESC_HEADER_NAME]: requestDesc,
              },
            }
          )
        })
        await Promise.all(deleteAnns)
        res.status(200).json({
          totalDeleted: annotations.length,
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
