import { ISearchState } from "./state"

import { range } from "../../../utils/arrayUtils"
import { IAtiProject } from "../../../types/ati"

export const getTotalPages = (state: ISearchState): number =>
  Math.ceil(state.totalCount / state.perPage)

export const getAtis = (state: ISearchState): IAtiProject[] => {
  if (state.status === "active") {
    return []
  }
  const indices = range(
    state.page * state.perPage,
    Math.min(state.totalCount, state.page * state.perPage + state.perPage) - 1,
    1
  )
  const atis = indices.map((index) => state.atiProjects[index])
  return atis.filter((ati) => ati)
}

export const getShowPagination = (state: ISearchState): boolean => {
  return ["inactive", "finished"].includes(state.status) && getTotalPages(state) > 1
}

export const getLoadingDesc = (state: ISearchState): string | undefined => {
  if (["inactive", "finished"].includes(state.status)) {
    if (state.totalCount <= state.perPage) {
      return `${state.totalCount} project(s)`
    }
    return `${state.page * state.perPage + 1} to ${Math.min(
      state.totalCount,
      state.page * state.perPage + state.perPage
    )} of ${state.totalCount} project(s)`
  } else if (state.status === "active") {
    return "Searching..."
  } else {
    return state.error
  }
}

export const getLoadingIconDesc = (state: ISearchState): string => {
  if (state.status == "inactive") {
    return "Inactive!"
  } else if (state.status === "finished") {
    return "Success!"
  } else if (state.status === "active") {
    return "Searching..."
  } else {
    return "Error!"
  }
}
