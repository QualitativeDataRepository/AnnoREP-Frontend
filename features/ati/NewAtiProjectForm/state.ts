import { InlineLoadingStatus } from "carbon-components-react"
import { IMyDataSearch } from "../../../types/api"

import { IDatasetOption } from "../../../types/dataverse"

export interface ISearchDatasetState {
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

export enum SearchDatasetActionType {
  SEARCH_INIT = "SEARCH_INIT",
  SEARCH_FAILURE = "SEARCH_FAILURE",
  UPDATE_PAGE = "UPDATE_PAGE",
  SEARCH_PAGE = "SEARCH_PAGE",
  UPDATE_Q = "UPDATE_Q",
  SEARCH_Q = "SEARCH_Q",
  NO_RESULTS = "NO_RESULTS",
}

export type ISearchDatasetAction =
  | { type: SearchDatasetActionType.SEARCH_INIT }
  | { type: SearchDatasetActionType.SEARCH_FAILURE; payload: string }
  | { type: SearchDatasetActionType.UPDATE_PAGE }
  | { type: SearchDatasetActionType.SEARCH_PAGE; payload: IMyDataSearch }
  | { type: SearchDatasetActionType.UPDATE_Q; payload: string }
  | { type: SearchDatasetActionType.SEARCH_Q; payload: IMyDataSearch }
  | { type: SearchDatasetActionType.NO_RESULTS }

export function searchDatasetReducer(
  state: ISearchDatasetState,
  action: ISearchDatasetAction
): ISearchDatasetState {
  switch (action.type) {
    case SearchDatasetActionType.SEARCH_INIT: {
      return { ...state, status: "active", error: "" }
    }
    case SearchDatasetActionType.SEARCH_FAILURE: {
      return { ...state, status: "error", error: action.payload }
    }
    case SearchDatasetActionType.UPDATE_PAGE: {
      return { ...state, page: state.page + 1, fetchPage: state.currentTotal < state.totalCount }
    }
    case SearchDatasetActionType.SEARCH_PAGE: {
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
    case SearchDatasetActionType.UPDATE_Q: {
      return {
        ...state,
        q: action.payload,
        fetchQ: true,
      }
    }
    case SearchDatasetActionType.SEARCH_Q: {
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
    case SearchDatasetActionType.NO_RESULTS: {
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
