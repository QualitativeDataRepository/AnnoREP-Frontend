import { ReactNode } from "react"

import { NotificationKind } from "carbon-components-react"

import { SearchState } from "./state"

import { range } from "../../../utils/arrayUtils"
import { IAtiProject } from "../../../types/ati"

export const getStart = (state: SearchState): number => state.page * state.perPage + 1

export const getEnd = (state: SearchState): number =>
  Math.min(state.totalCount, state.page * state.perPage + state.perPage)

export const getTotalCount = (state: SearchState): number => state.totalCount

export const getTotalPages = (state: SearchState): number =>
  Math.ceil(state.totalCount / state.perPage)

export const getShowResultDesc = (state: SearchState): boolean =>
  ["inactive", "finished"].includes(state.status) && state.totalCount > 0

export const getAtis = (state: SearchState): IAtiProject[] => {
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

export const getShowPagination = (state: SearchState): boolean => {
  return getTotalPages(state) > 1 && ["inactive", "finished"].includes(state.status)
}

export const getInlineNotficationKind = (state: SearchState): NotificationKind => {
  if (state.status === "active") {
    return "info"
  } else if (state.status === "finished") {
    return state.currentTotal === 0 ? "info" : "success"
  } else {
    return "error"
  }
}

export const getInlineNotficationSubtitle = (state: SearchState): ReactNode => {
  if (state.status === "active") {
    return `Fetching ATI projects...`
  } else if (state.status === "finished") {
    return state.currentTotal === 0 ? "No ATI projects found." : `Finished fetching ATI projects.`
  } else {
    return state.error
  }
}

export const getInlineNotficationTitle = (state: SearchState): string => {
  if (state.status === "active") {
    return "Status"
  } else if (state.status === "finished") {
    return state.currentTotal === 0 ? "Status" : "Success!"
  } else {
    return "Error!"
  }
}

export const showResult = (state: SearchState): boolean => state.totalCount > 0
