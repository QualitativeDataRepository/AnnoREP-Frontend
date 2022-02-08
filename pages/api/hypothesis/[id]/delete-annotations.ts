import axios, { AxiosPromise } from "axios"
import { NextApiRequest, NextApiResponse } from "next"
import { getSession } from "next-auth/client"

import { REQUEST_DESC_HEADER_NAME } from "../../../../constants/http"
import { getResponseFromError } from "../../../../utils/httpRequestUtils"

export default async function handler(req: NextApiRequest, res: NextApiResponse): Promise<void> {
  if (req.method === "DELETE") {
    const session = await getSession({ req })
    const { data } = await axios.get(`${process.env.HYPOTHESIS_SERVER_URL}/api/profile`, {
      headers: { Authorization: `Bearer ${process.env.ADMIN_HYPOTHESIS_API_TOKEN}` },
    })
    if (session) {
      const { id, isAdminAuthor } = req.query
      const { annotations } = req.body
      const requestDesc = `Deleting annotations from dataset ${id}`
      const { hypothesisApiToken: userHypothesisApiToken, hypothesisUserId: userHypothesisUserId } =
        session
      let hypothesisApiToken = userHypothesisApiToken
      let hypothesisUserId = userHypothesisUserId
      if (isAdminAuthor === "true") {
        hypothesisApiToken = process.env.ADMIN_HYPOTHESIS_API_TOKEN
        hypothesisUserId = data.userid
      }
      try {
        const deletableAnnotations = annotations.filter((annotation: any) =>
          annotation.permissions.delete.includes(hypothesisUserId)
        )
        const deleteAnns: AxiosPromise<any>[] = deletableAnnotations.map((annotation: any) => {
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
          totalDeleted:
            deletableAnnotations.length === annotations.length
              ? annotations.length
              : `${deletableAnnotations.length}/${annotations.length}`,
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
