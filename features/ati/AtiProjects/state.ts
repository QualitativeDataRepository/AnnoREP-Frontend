import { InlineLoadingStatus } from "carbon-components-react"

import { IMyDataSearch } from "../../../types/api"
import { IAtiProject } from "../../../types/ati"

export interface SearchState {
  currentTotal: number
  totalCount: number
  atiProjects: Record<number, IAtiProject>
  status: InlineLoadingStatus
  page: number
  fetchPage: boolean
  perPage: number
  q: string
  fetchQ: boolean
  error?: string
  selectedPublicationStatuses: Record<string, boolean>
  selectedFilters: Record<string, string[]>
  publicationStatusCount: Record<string, number>
  fetchPublicationStatus: boolean
}

export type Action =
  | { type: "SEARCH_INIT" }
  | { type: "SEARCH_FAILURE"; payload: string }
  | { type: "UPDATE_PAGE"; payload: number }
  | { type: "SEARCH_PAGE"; payload: IMyDataSearch }
  | { type: "UPDATE_Q"; payload: string }
  | { type: "SEARCH_Q"; payload: IMyDataSearch }
  | { type: "UPDATE_SELECTED_PUBLICATION_STATUS"; payload: { id: string; checked: boolean } }
  | { type: "NO_RESULTS" }

export function searchReducer(state: SearchState, action: Action): SearchState {
  switch (action.type) {
    case "SEARCH_INIT": {
      return { ...state, status: "active", error: "" }
    }
    case "SEARCH_FAILURE": {
      return { ...state, status: "error", error: action.payload }
    }
    case "UPDATE_PAGE": {
      const cursor = action.payload * state.perPage
      const fetchPage = state.currentTotal < state.totalCount && !(cursor in state.atiProjects)
      return { ...state, page: action.payload, fetchPage }
    }
    case "SEARCH_PAGE": {
      const atiData = action.payload.datasets
      const newAtis = atiData.reduce((acc, curr, i) => {
        acc[i + action.payload.start] = curr
        return acc
      }, {} as Record<number, IAtiProject>)
      return {
        ...state,
        atiProjects: { ...state.atiProjects, ...newAtis },
        currentTotal: state.currentTotal + atiData.length,
        status: "finished",
        fetchPage: false,
      }
    }
    case "UPDATE_Q": {
      return { ...state, q: action.payload, fetchQ: true }
    }
    case "SEARCH_Q": {
      const atiData = action.payload.datasets
      const newAtis = atiData.reduce((acc, curr, i) => {
        acc[i] = curr
        return acc
      }, {} as Record<number, IAtiProject>)
      return {
        ...state,
        totalCount: action.payload.totalCount,
        currentTotal: atiData.length,
        atiProjects: newAtis,
        status: "finished",
        page: 0,
        selectedPublicationStatuses:
          action.payload.selectedFilters && action.payload.selectedFilters["publication_statuses"]
            ? (action.payload.selectedFilters["publication_statuses"] as string[]).reduce(
                (acc, curr) => {
                  acc[curr] = true
                  return acc
                },
                { ...state.selectedPublicationStatuses }
              )
            : {},
        selectedFilters: action.payload.selectedFilters,
        publicationStatusCount: action.payload.publicationStatusCount,
        perPage: action.payload.docsPerPage,
        fetchQ: false,
        fetchPublicationStatus: false,
      }
    }
    case "UPDATE_SELECTED_PUBLICATION_STATUS": {
      return {
        ...state,
        fetchPublicationStatus: true,
        selectedPublicationStatuses: {
          ...state.selectedPublicationStatuses,
          [action.payload.id]: action.payload.checked,
        },
      }
    }
    case "NO_RESULTS": {
      const newPublicationStatusCount = Object.keys(state.publicationStatusCount).reduce(
        (acc, curr) => {
          acc[curr] = 0
          return acc
        },
        {} as Record<string, number>
      )
      return {
        ...state,
        atiProjects: {},
        totalCount: 0,
        currentTotal: 0,
        publicationStatusCount: newPublicationStatusCount,
        fetchPage: false,
        fetchQ: false,
        fetchPublicationStatus: false,
      }
    }
    default: {
      return state
    }
  }
}
