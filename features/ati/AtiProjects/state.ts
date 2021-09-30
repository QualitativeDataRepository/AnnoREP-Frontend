import { InlineLoadingStatus } from "carbon-components-react"

import { IAtiProject } from "../../../types/ati"

export interface SearchState {
  currentTotal: number
  totalCount: number
  atiProjects: Record<number, IAtiProject>
  status: InlineLoadingStatus
  page: number
  perPage: number
  q: string
  fetchQ: boolean
  error?: string
  selectedPublicationStatuses: Record<string, boolean>
  selectedFilters: Record<string, string[]>
  publicationStatusCount: Record<string, number>
  fetchPublicationStatus: boolean
}

export interface Action {
  type:
    | "SEARCH_INIT"
    | "SEARCH_PAGE"
    | "SEARCH_FAILURE"
    | "UPDATE_PAGE"
    | "SEARCH_Q"
    | "UPDATE_Q"
    | "UPDATE_SELECTED_PUBLICATION_STATUS"
    | "NO_RESULTS"
  payload?: any
}

export function searchReducer(state: SearchState, action: Action): SearchState {
  switch (action.type) {
    case "SEARCH_INIT": {
      return { ...state, status: "active", error: "" } as SearchState
    }
    case "SEARCH_PAGE": {
      const atiData = action.payload.datasets as IAtiProject[]
      const newAtis = atiData.reduce((acc, curr, i) => {
        acc[i + action.payload.start] = curr
        return acc
      }, {} as Record<number, IAtiProject>)
      return {
        ...state,
        atiProjects: { ...state.atiProjects, ...newAtis },
        currentTotal: state.currentTotal + atiData.length,
        status: "finished",
      } as SearchState
    }
    case "SEARCH_FAILURE": {
      return { ...state, status: "error", error: action.payload } as SearchState
    }
    case "SEARCH_Q": {
      const atiData = action.payload.datasets as IAtiProject[]
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
      } as SearchState
    }
    case "UPDATE_PAGE": {
      return { ...state, page: action.payload } as SearchState
    }
    case "UPDATE_Q": {
      return { ...state, q: action.payload, fetchQ: true } as SearchState
    }
    case "UPDATE_SELECTED_PUBLICATION_STATUS": {
      return {
        ...state,
        fetchPublicationStatus: true,
        selectedPublicationStatuses: {
          ...state.selectedPublicationStatuses,
          [action.payload.id as string]: action.payload.checked as boolean,
        },
      } as SearchState
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
        fetchQ: false,
        fetchPublicationStatus: false,
      } as SearchState
    }
    default: {
      return state
    }
  }
}
