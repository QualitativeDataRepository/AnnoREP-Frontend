import { act } from "@testing-library/react"

import { getLoadingDesc, getTotalPages } from "../selectors"
import { SearchState } from "../state"

describe("getTotalPages", () => {
  test("shows total pages", () => {
    const initialState: SearchState = {
      totalCount: 0,
      currentTotal: 0,
      atiProjects: {},
      status: "inactive",
      page: 0,
      perPage: 10,
      q: "",
      fetchQ: false,
      error: "",
      selectedPublicationStatuses: {},
      selectedFilters: {},
      publicationStatusCount: {},
      fetchPublicationStatus: false,
    }

    expect(getTotalPages(initialState)).toEqual(0)

    act(() => {
      initialState.totalCount = 1
    })
    expect(getTotalPages(initialState)).toEqual(1)

    act(() => {
      initialState.totalCount = 11
    })
    expect(getTotalPages(initialState)).toEqual(2)

    act(() => {
      initialState.totalCount = 20
    })
    expect(getTotalPages(initialState)).toEqual(2)

    act(() => {
      initialState.totalCount = 21
    })
    expect(getTotalPages(initialState)).toEqual(3)
  })
})

describe("getLoadingDesc", () => {
  test("shows loading desc", () => {
    const initialState: SearchState = {
      totalCount: 21,
      currentTotal: 10,
      atiProjects: {},
      status: "inactive",
      page: 0,
      perPage: 10,
      q: "",
      fetchQ: false,
      error: "",
      selectedPublicationStatuses: {},
      selectedFilters: {},
      publicationStatusCount: {},
      fetchPublicationStatus: false,
    }

    expect(getLoadingDesc(initialState)).toEqual("1 to 10 of 21 project(s)")

    act(() => {
      initialState.page = 1
      initialState.currentTotal = 20
    })
    expect(getLoadingDesc(initialState)).toEqual("11 to 20 of 21 project(s)")

    act(() => {
      initialState.page = 2
      initialState.currentTotal = 21
    })
    expect(getLoadingDesc(initialState)).toEqual("21 to 21 of 21 project(s)")

    act(() => {
      initialState.totalCount = 5
      initialState.currentTotal = 5
    })
    expect(getLoadingDesc(initialState)).toEqual("5 project(s)")

    act(() => {
      initialState.status = "active"
    })
    expect(getLoadingDesc(initialState)).toEqual("Searching...")

    act(() => {
      initialState.status = "error"
      initialState.error = "error"
    })
    expect(getLoadingDesc(initialState)).toEqual("error")
  })
})
