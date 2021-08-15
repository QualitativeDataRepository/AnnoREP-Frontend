import axios from "axios"
import { NextApiRequest, NextApiResponse } from "next"
import { getSession } from "next-auth/client"

import {
  ANNOREP_METADATA_VALUE,
  DATAVERSE_HEADER_NAME,
  KIND_OF_DATA_NAME,
  NUMBER_OF_ATI_PROJECTS_PER_PAGE,
  PublicationStatus,
  VersionState,
} from "../../constants/dataverse"
import { REQUEST_DESC_HEADER_NAME } from "../../constants/http"
import { IAtiProject } from "../../types/ati"
import { getResponseFromError } from "../../utils/httpRequestUtils"

export default async function handler(req: NextApiRequest, res: NextApiResponse) {
  if (req.method === "GET") {
    const session = await getSession({ req })
    if (session) {
      const { dataverseApiToken } = session
      const { start, q } = req.query
      try {
        const { data } = await axios.get(`${process.env.DATAVERSE_SERVER_URL}/api/search`, {
          params: {
            q: q || "*",
            type: "dataset",
            sort: "date",
            order: "desc",
            start: start,
            per_page: NUMBER_OF_ATI_PROJECTS_PER_PAGE,
            show_entity_ids: true,
            fq: `${KIND_OF_DATA_NAME}:${ANNOREP_METADATA_VALUE}`,
          },
          headers: {
            [DATAVERSE_HEADER_NAME]: dataverseApiToken,
            [REQUEST_DESC_HEADER_NAME]: `Searching for ${ANNOREP_METADATA_VALUE} datasets`,
          },
        })
        const items = data.data.items
        const atiProjects: IAtiProject[] = []
        for (let i = 0; i < items.length; i++) {
          atiProjects.push({
            id: items[i].entity_id,
            title: items[i].name,
            description: items[i].description,
            status:
              items[i].versionState === VersionState.Released
                ? PublicationStatus.Published
                : PublicationStatus.Unpublished,
            version: items[i].majorVersion
              ? `${items[i].majorVersion}.${items[i].minorVersion}`
              : items[i].versionState,
          })
        }
        res.status(200).json({
          atiProjects,
          start: data.data.start,
          totalCount: data.data.total_count,
          responseCount: data.data.count_in_response,
        })
      } catch (e) {
        const { status, message } = getResponseFromError(e)
        res.status(status).json({ message })
      }
    } else {
      res.status(401).json({ message: "Unauthorized. Please login. " })
    }
  } else {
    res.status(405).json({ message: `${req.method} method is not allowed.` })
  }
}
