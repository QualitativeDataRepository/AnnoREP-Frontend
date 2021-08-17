import { InlineLoadingStatus } from "carbon-components-react"

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

export interface SearchDatasetAction {
  type:
    | "SEARCH_INIT"
    | "SEARCH_FAILURE"
    | "SEARCH_Q"
    | "UPDATE_Q"
    | "UPDATE_PAGE"
    | "SEARCH_PAGE"
    | "NO_RESULTS"
  payload?: any
}

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
      return { ...state, page: state.page + 1, fetchPage: true }
    }
    case "SEARCH_PAGE": {
      const newDatasets: IDatasetOption[] = action.payload.datasets.map((dataset: any) => {
        return { id: dataset.id, name: dataset.name }
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
      const newDatasets: IDatasetOption[] = action.payload.datasets.map((dataset: any) => {
        return { id: dataset.id, name: dataset.name }
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
      }
    }
    default: {
      return state
    }
  }
}
