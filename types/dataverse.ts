export interface IDataset {
  id: string
  doi: string
  title: string
  status?: string
  version?: string
}

export interface IDatasource {
  id: string
  name: string
  uri: string
}

interface IManuscript {
  id: string
  name: string
}

export interface IATIProjectDetails {
  dataset: IDataset
  datasources: IDatasource[]
  manuscript: IManuscript
}
