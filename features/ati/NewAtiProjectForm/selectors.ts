import { ISearchDatasetState } from "./state"

export const getItems = (state: ISearchDatasetState): { id: string; label: string }[] => {
  const items = state.datasets.map((dataset) => {
    return { id: dataset.id, label: dataset.name }
  })
  return items
}

export const getResultDesc = (state: ISearchDatasetState): string => {
  if (["inactive", "finished"].includes(state.status)) {
    if (state.currentTotal < state.totalCount) {
      return `${state.currentTotal} of ${state.totalCount} data project(s)`
    } else {
      return `${state.totalCount} data project(s)`
    }
  } else if (state.status === "active") {
    return "Searching..."
  } else {
    return ""
  }
}

export const getErrorMsg = (state: ISearchDatasetState): string => {
  return `${state.error} Please create a new data project.`
}

export const hasMoreDatasets = (state: ISearchDatasetState): boolean =>
  state.currentTotal < state.totalCount

export const getSearchPlaceholder = (state: ISearchDatasetState): string =>
  state.totalCount === 0 ? "Please create a new data project" : "Please choose a data project"
