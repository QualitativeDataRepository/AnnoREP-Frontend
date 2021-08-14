export interface IDataset {
  id: string
  doi: string
  title: string
  description?: string
  status?: string
  version?: string
  zip?: string
}

export interface IDatasource {
  id: string
  name: string
  uri: string
}

export interface IManuscript {
  id: string
  name: string
  ingest?: string
}

export interface IATIProjectDetails {
  dataset: IDataset
  datasources: IDatasource[]
  manuscript: IManuscript
}
