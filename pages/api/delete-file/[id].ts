import axios from "axios"
import { NextApiRequest, NextApiResponse } from "next"
import { getSession } from "next-auth/client"
import { getResponseFromError } from "../../../utils/httpRequestUtils"

export default async function handler(req: NextApiRequest, res: NextApiResponse): Promise<void> {
  if (req.method === "DELETE") {
    const session = await getSession({ req })
    if (session) {
      const { id } = req.query
      const { dataverseApiToken } = session
      try {
        const { status, data } = await axios({
          method: "DELETE",
          url: `${process.env.DATAVERSE_SERVER_URL}/dvn/api/data-deposit/v1.1/swordv2/edit-media/file/${id}`,
          auth: {
            username: dataverseApiToken as string,
            password: "",
          },
        })
        res.status(status).json(data)
      } catch (e) {
        const { status, message } = getResponseFromError(e, `Deleting file ${id}`)
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
