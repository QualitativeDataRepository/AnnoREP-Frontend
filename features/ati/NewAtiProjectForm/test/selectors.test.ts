import { act } from "@testing-library/react"

import { ISearchDatasetState } from "../state"
import { getItems, getResultDesc } from "../selectors"

describe("getItems", () => {
  test("handles empty array", () => {
    const initialState: ISearchDatasetState = {
      currentTotal: 0,
      totalCount: 0,
      datasets: [],
      status: "inactive",
      page: 0,
      fetchPage: false,
      perPage: 10,
      q: "",
      fetchQ: false,
      error: "",
    }
    expect(getItems(initialState)).toHaveLength(0)
  })

  test("creates label field", () => {
    const initialState: ISearchDatasetState = {
      currentTotal: 1,
      totalCount: 1,
      datasets: [
        {
          id: "dataset-1",
          name: "Dataset 1",
        },
      ],
      status: "inactive",
      page: 0,
      fetchPage: false,
      perPage: 10,
      q: "",
      fetchQ: false,
      error: "",
    }
    expect(getItems(initialState)).toEqual([
      {
        id: "dataset-1",
        label: "Dataset 1",
      },
    ])
  })
})

describe("getResultDesc", () => {
  test("shows result desc", () => {
    let initialState: ISearchDatasetState = {
      currentTotal: 1,
      totalCount: 1,
      datasets: [
        {
          id: "dataset-1",
          name: "Dataset 1",
        },
      ],
      status: "inactive",
      page: 0,
      fetchPage: false,
      perPage: 10,
      q: "",
      fetchQ: false,
      error: "",
    }
    expect(getResultDesc(initialState)).toEqual("1 dataset(s)")

    act(() => {
      initialState = {
        ...initialState,
        currentTotal: 10,
        totalCount: 11,
      }
    })
    expect(getResultDesc(initialState)).toEqual("10 of 11 dataset(s)")

    act(() => {
      initialState.status = "active"
    })
    expect(getResultDesc(initialState)).toEqual("Searching...")

    act(() => {
      initialState.status = "error"
    })
    expect(getResultDesc(initialState)).toEqual("")
  })
})
