import { AxiosResponse } from "axios"

import { ANNOREP_METADATA_VALUE, SOURCE_MANUSCRIPT_TAG } from "../constants/dataverse"
import { IATIProjectDetails } from "../types/dataverse"

export function createAtiProjectDetails(
  response: AxiosResponse<any>,
  ingestPdf: string
): IATIProjectDetails {
  const latest = response.data.data.latestVersion
  const metadataFields = latest.metadataBlocks.citation.fields
  const manuscript = latest.files.find(
    (file: any) =>
      file.directoryLabel === ANNOREP_METADATA_VALUE && file.description === SOURCE_MANUSCRIPT_TAG
  )
  const datasources = latest.files.filter(
    (file: any) => file.categories === undefined || file.categories.includes("Data")
  )
  return {
    dataset: {
      id: latest.datasetId,
      doi: latest.datasetPersistentId,
      title: metadataFields.find((field: any) => field.typeName === "title").value,
      description: metadataFields.find((field: any) => field.typeName === "dsDescription").value[0]
        .dsDescriptionValue.value,
      subjects: metadataFields.find((field: any) => field.typeName === "subject").value,
    },
    manuscript: {
      id: manuscript?.dataFile.id || "",
      name: manuscript?.dataFile.filename || "",
      ingest: ingestPdf,
    },
    datasources: datasources.map((file: any) => {
      return {
        id: `${file.dataFile.id}`,
        name: file.dataFile.filename,
        uri: `${process.env.DATAVERSE_SERVER_URL}/file.xhtml?persistentId=${file.dataFile.persistentId}`,
      }
    }),
  }
}
