import { InlineLoadingStatus } from "carbon-components-react"

import { IAtiProject } from "../../../types/ati"

export interface SearchState {
  currentTotal: number
  totalCount: number
  atiProjects: Record<number, IAtiProject>
  status: InlineLoadingStatus
  page: number
  error?: string
}

export interface Action {
  type: "SEARCH_INIT" | "SEARCH_SUCCESS" | "SEARCH_FAILURE" | "UPDATE_PAGE" | "SEARCH_CLEAN_UP"
  payload?: any
}

export function searchReducer(state: SearchState, action: Action) {
  switch (action.type) {
    case "SEARCH_INIT": {
      return { ...state, status: "active", error: "" } as SearchState
    }
    case "SEARCH_SUCCESS": {
      const atiData = action.payload.atiProjects as IAtiProject[]
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
    case "SEARCH_CLEAN_UP": {
      return { ...state, status: "inactive" } as SearchState
    }
    case "UPDATE_PAGE": {
      return { ...state, page: action.payload }
    }
    default: {
      return state
    }
  }
}
