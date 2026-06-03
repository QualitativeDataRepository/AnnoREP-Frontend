import { NextApiRequest, NextApiResponse } from "next"
import { getSession } from "next-auth/react"

import { axiosClient } from "../../../../features/app"

import { REQUEST_DESC_HEADER_NAME } from "../../../../constants/http"
import { getResponseFromError } from "../../../../utils/httpRequestUtils"

export default async function handler(req: NextApiRequest, res: NextApiResponse): Promise<void> {
  if (req.method === "DELETE") {
    const session = await getSession({ req })
    const { data } = await axiosClient.get(`${process.env.HYPOTHESIS_SERVER_URL}/api/profile`, {
      headers: { Authorization: `Bearer ${process.env.ADMIN_HYPOTHESIS_API_TOKEN}` },
    })
    if (session) {
      const { id } = req.query
      const { annotations, isAdminAuthor } = req.body
      const requestDesc = `Deleting annotations from data project ${id}`
      const { hypothesisApiToken: userHypothesisApiToken, hypothesisUserId: userHypothesisUserId } =
        session
      let hypothesisApiToken = userHypothesisApiToken
      let hypothesisUserId = userHypothesisUserId
      if (isAdminAuthor) {
        hypothesisApiToken = process.env.ADMIN_HYPOTHESIS_API_TOKEN
        hypothesisUserId = data.userid
      }
      try {
        const deletableAnnotations = annotations.filter((annotation: any) =>
          annotation.permissions.delete.includes(hypothesisUserId)
        )
        const deleteAnns = deletableAnnotations.map((annotation: any) => {
          return axiosClient.delete(
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
          total: deletableAnnotations.length,
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
