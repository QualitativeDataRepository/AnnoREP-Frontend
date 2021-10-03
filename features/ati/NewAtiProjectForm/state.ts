import { InlineLoadingStatus } from "carbon-components-react"
import { IMyDataSearch } from "../../../types/api"

import { IDatasetOption } from "../../../types/dataverse"

export interface SearchDatasetState {
  currentTotal: number
  totalCount: number
  datasets: IDatasetOption[]
  status: InlineLoadingStatus
  page: number
  fetchPage: boolean
  perPage: number
  q: string
  fetchQ: boolean
  error?: string
}

export type SearchDatasetAction =
  | { type: "SEARCH_INIT" }
  | { type: "SEARCH_FAILURE"; payload: string }
  | { type: "UPDATE_PAGE" }
  | { type: "SEARCH_PAGE"; payload: IMyDataSearch }
  | { type: "UPDATE_Q"; payload: string }
  | { type: "SEARCH_Q"; payload: IMyDataSearch }
  | { type: "NO_RESULTS" }

export function searchDatasetReducer(
  state: SearchDatasetState,
  action: SearchDatasetAction
): SearchDatasetState {
  switch (action.type) {
    case "SEARCH_INIT": {
      return { ...state, status: "active", error: "" }
    }
    case "SEARCH_FAILURE": {
      return { ...state, status: "error", error: action.payload }
    }
    case "UPDATE_PAGE": {
      return { ...state, page: state.page + 1, fetchPage: state.currentTotal < state.totalCount }
    }
    case "SEARCH_PAGE": {
      const newDatasets: IDatasetOption[] = action.payload.datasets.map(({ id, name }) => {
        return { id, name }
      })
      return {
        ...state,
        status: "finished",
        fetchPage: false,
        currentTotal: state.currentTotal + newDatasets.length,
        datasets: [...state.datasets, ...newDatasets],
      }
    }
    case "UPDATE_Q": {
      return {
        ...state,
        q: action.payload,
        fetchQ: true,
      }
    }
    case "SEARCH_Q": {
      const newDatasets: IDatasetOption[] = action.payload.datasets.map(({ id, name }) => {
        return { id, name }
      })
      return {
        ...state,
        status: "finished",
        fetchQ: false,
        totalCount: action.payload.totalCount,
        currentTotal: newDatasets.length,
        datasets: newDatasets,
        page: 0,
        perPage: action.payload.docsPerPage,
      }
    }
    case "NO_RESULTS": {
      return {
        ...state,
        totalCount: 0,
        currentTotal: 0,
        datasets: [],
        fetchQ: false,
      }
    }
    default: {
      return state
    }
  }
}
