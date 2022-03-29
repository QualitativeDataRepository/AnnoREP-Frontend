import { NextApiRequest, NextApiResponse } from "next"
import { getSession } from "next-auth/client"

import { axiosClient } from "../../../../features/app"

import { DATAVERSE_HEADER_NAME } from "../../../../constants/dataverse"
import { REQUEST_DESC_HEADER_NAME } from "../../../../constants/http"
import { getResponseFromError } from "../../../../utils/httpRequestUtils"

export default async function handler(req: NextApiRequest, res: NextApiResponse): Promise<void> {
  if (req.method === "GET") {
    const session = await getSession({ req })
    if (session) {
      const { id } = req.query
      const requestDesc = `Getting data files for data project ${id}`
      try {
        const { status, data } = await axiosClient({
          method: "GET",
          url: `${process.env.DATAVERSE_SERVER_URL}/api/datasets/${id}`,
          headers: {
            [DATAVERSE_HEADER_NAME]: session.dataverseApiToken,
            [REQUEST_DESC_HEADER_NAME]: requestDesc,
          },
        })
        const latest = data.data.latestVersion
        const datasources = latest.files.filter(
          (file: any) => file.categories === undefined || file.categories.includes("Data")
        )
        const formattedDatasources = datasources.map((file: any) => {
          return {
            id: `${file.dataFile.id}`,
            name: file.dataFile.filename,
            uri: `${process.env.DATAVERSE_SERVER_URL}/file.xhtml?persistentId=${file.dataFile.persistentId}`,
          }
        })
        res.status(status).json(formattedDatasources)
      } catch (e) {
        const { status, message } = getResponseFromError(e, requestDesc)
        console.error(status, message)
        res.status(status).json({ message })
      }
    } else {
      res.status(401).json({ message: "Unauthorized. Please login." })
    }
  } else {
    res.status(405).json({ message: `${req.method} method is not allowed.` })
  }
}
