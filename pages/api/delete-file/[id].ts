import axios from "axios"
import { NextApiRequest, NextApiResponse } from "next"
import { getSession } from "next-auth/client"

export default async function handler(req: NextApiRequest, res: NextApiResponse) {
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
        res
          .status(e.response.status)
          .json({ msg: `Failed to delete file ${id}. ${e.response.data.message}` })
      }
    } else {
      res.status(401).json({ msg: "Unauthorized! Please login." })
    }
  } else {
    res.status(405).json({ msg: `${req.method} method is not allowed.` })
  }
}
