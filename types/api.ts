import { IAtiProject } from "./ati"

// my data search endpoint
export interface IMyDataSearch {
  datasets: IAtiProject[]
  totalCount: number
  start: number
  docsPerPage: number
  publicationStatusCount: Record<string, number>
  selectedFilters: Record<string, string[]>
}
