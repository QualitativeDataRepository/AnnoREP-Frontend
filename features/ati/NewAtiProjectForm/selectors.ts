import { SearchDatasetState } from "./state"

export const getItems = (state: SearchDatasetState): { id: string; label: string }[] => {
  const items = state.datasets.map((dataset) => {
    return { id: dataset.id, label: dataset.name }
  })
  return items
}

export const getResultDesc = (state: SearchDatasetState): string => {
  if (["inactive", "finished"].includes(state.status)) {
    if (state.currentTotal < state.totalCount) {
      return `${state.currentTotal} of ${state.totalCount} dataset(s)`
    } else {
      return `${state.totalCount} dataset(s)`
    }
  } else if (state.status === "active") {
    return "Searching..."
  } else {
    return ""
  }
}

export const getErrorMsg = (state: SearchDatasetState): string => {
  return `${state.error} Please create a new dataset.`
}

export const hasMoreDatasets = (state: SearchDatasetState): boolean =>
  state.currentTotal < state.totalCount

export const getSearchPlaceholder = (state: SearchDatasetState) =>
  state.totalCount === 0 ? "Please create a new dataset" : "Please choose a dataset"
