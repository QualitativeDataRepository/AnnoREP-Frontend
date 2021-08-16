import { TagTypeName } from "carbon-components-react"

export const DATAVERSE_HEADER_NAME = "X-Dataverse-Key"

export const SOURCE_MANUSCRIPT_TAG = "Source manuscript"

export const KIND_OF_DATA_NAME = "kindOfData"

export const ANNOREP_METADATA_FIELD = `http://rdf-vocabulary.ddialliance.org/discovery#${KIND_OF_DATA_NAME}`

export const ANNOREP_METADATA_VALUE = "AnnoRep"

export enum PublicationStatus {
  Published = "Published",
  Unpublished = "Unpublished",
}

export enum VersionState {
  Draft = "DRAFT",
  Released = "RELEASED",
}

export const PUBLICATION_STATUSES = [
  "Published",
  "Unpublished",
  "Draft",
  "In Review",
  "Deaccessioned",
]

export const PUBLICATION_STATUSES_COLOR: Record<string, TagTypeName> = {
  [PUBLICATION_STATUSES[0]]: "green",
  [PUBLICATION_STATUSES[1]]: "red",
  [PUBLICATION_STATUSES[2]]: "blue",
  [PUBLICATION_STATUSES[3]]: "green",
  [PUBLICATION_STATUSES[4]]: "gray",
}

export const DATASET_DV_TYPE = "Dataset"
