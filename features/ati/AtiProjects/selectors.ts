import { ReactNode } from "react"

import { NotificationKind } from "carbon-components-react"

import { SearchState } from "./state"

import { NUMBER_OF_ATI_PROJECTS_PER_PAGE } from "../../../constants/dataverse"
import { range } from "../../../utils/arrayUtils"
import { IAtiProject } from "../../../types/ati"

export const getStart = (state: SearchState): number =>
  state.page * NUMBER_OF_ATI_PROJECTS_PER_PAGE + 1

export const getEnd = (state: SearchState): number =>
  Math.min(
    state.totalCount,
    state.page * NUMBER_OF_ATI_PROJECTS_PER_PAGE + NUMBER_OF_ATI_PROJECTS_PER_PAGE
  )

export const getTotalPages = (state: SearchState): number =>
  Math.ceil(state.totalCount / NUMBER_OF_ATI_PROJECTS_PER_PAGE)

export const getAtis = (state: SearchState): IAtiProject[] => {
  const indices = range(
    state.page * NUMBER_OF_ATI_PROJECTS_PER_PAGE,
    Math.min(
      state.totalCount,
      state.page * NUMBER_OF_ATI_PROJECTS_PER_PAGE + NUMBER_OF_ATI_PROJECTS_PER_PAGE
    ) - 1,
    1
  )
  const atis = indices.map((index) => state.atiProjects[index])
  return atis.filter((ati) => ati)
}

export const getShowPagination = (state: SearchState): boolean => {
  return getTotalPages(state) > 1 && ["inactive", "finished"].includes(state.status)
}

export const getInlineNotficationKind = (state: SearchState): NotificationKind =>
  state.status === "active" ? "info" : state.status === "finished" ? "success" : "error"

export const getInlineNotficationSubtitle = (state: SearchState): ReactNode =>
  state.status === "active"
    ? `Getting page ${state.page + 1} of ATI projects...`
    : state.status === "finished"
    ? `Finished getting page ${state.page + 1} of ATI projects.`
    : state.error

export const getInlineNotficationTitle = (state: SearchState): string =>
  state.status === "active" ? "Status" : state.status === "finished" ? "Success!" : "Error!"
