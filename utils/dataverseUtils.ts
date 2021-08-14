import { AxiosResponse } from "axios"

import {
  ANNOREP_METADATA_VALUE,
  SOURCE_MANUSCRIPT_TAG,
  VersionState,
  PublicationStatus,
} from "../constants/dataverse"
import { IATIProjectDetails } from "../types/dataverse"

export function createAtiProjectDetails(
  response: AxiosResponse<any>,
  datasetZip: string,
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
      version: latest.versionNumber
        ? `${latest.versionNumber}.${latest.versionMinorNumber}`
        : latest.versionState,
      status:
        latest.versionState === VersionState.Released
          ? PublicationStatus.Published
          : PublicationStatus.Unpublished,
      zip: datasetZip,
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
