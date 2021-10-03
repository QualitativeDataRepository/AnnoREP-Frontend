import { searchDatasetReducer, SearchDatasetState, SearchDatasetAction } from "../state"

describe("searchDatasetReducer", () => {
  const initialState: SearchDatasetState = {
    currentTotal: 1,
    totalCount: 2,
    datasets: [
      {
        id: "dataset-1",
        name: "Dataset 1",
      },
    ],
    status: "inactive",
    page: 0,
    fetchPage: false,
    perPage: 1,
    q: "",
    fetchQ: false,
    error: "",
  }
  test("has initial state", () => {
    expect(searchDatasetReducer(initialState, {} as SearchDatasetAction)).toEqual(initialState)
  })

  test("handles init", () => {
    expect(searchDatasetReducer(initialState, { type: "SEARCH_INIT" })).toEqual({
      ...initialState,
      status: "active",
    })
  })

  test("handles failure", () => {
    expect(
      searchDatasetReducer(initialState, { type: "SEARCH_FAILURE", payload: "error" })
    ).toEqual({ ...initialState, status: "error", error: "error" })
  })

  test("handles update page and should fetch datasets", () => {
    expect(searchDatasetReducer(initialState, { type: "UPDATE_PAGE" })).toEqual({
      ...initialState,
      page: 1,
      fetchPage: true,
    })
  })

  test("handles search page", () => {
    expect(
      searchDatasetReducer(initialState, {
        type: "SEARCH_PAGE",
        payload: {
          datasets: [
            {
              id: "dataset-2",
              name: "Dataset 2",
              description: "",
              citationHtml: "",
              dataverse: "",
              dataverseName: "",
              dataverseServerUrl: "",
              dateDisplay: "",
              publicationStatuses: [] as string[],
              userRoles: [] as string[],
            },
          ],
          totalCount: 2,
          start: 1,
          docsPerPage: 1,
          publicationStatusCount: {},
          selectedFilters: {},
        },
      })
    ).toEqual({
      ...initialState,
      status: "finished",
      fetchPage: false,
      currentTotal: 2,
      datasets: [...initialState.datasets, { id: "dataset-2", name: "Dataset 2" }],
    })
  })

  test("handles update q", () => {
    expect(searchDatasetReducer(initialState, { type: "UPDATE_Q", payload: "q" })).toEqual({
      ...initialState,
      q: "q",
      fetchQ: true,
    })
  })

  test("handles search q", () => {
    expect(
      searchDatasetReducer(initialState, {
        type: "SEARCH_Q",
        payload: {
          datasets: [
            {
              id: "dataset-2",
              name: "Dataset 2",
              description: "",
              citationHtml: "",
              dataverse: "",
              dataverseName: "",
              dataverseServerUrl: "",
              dateDisplay: "",
              publicationStatuses: [] as string[],
              userRoles: [] as string[],
            },
          ],
          totalCount: 2,
          start: 0,
          docsPerPage: 1,
          publicationStatusCount: {},
          selectedFilters: {},
        },
      })
    ).toEqual({
      ...initialState,
      status: "finished",
      fetchQ: false,
      totalCount: 2,
      currentTotal: 1,
      datasets: [{ id: "dataset-2", name: "Dataset 2" }],
      page: 0,
      perPage: 1,
    })
  })

  test("handles no results", () => {
    expect(searchDatasetReducer(initialState, { type: "NO_RESULTS" })).toEqual({
      ...initialState,
      totalCount: 0,
      currentTotal: 0,
      datasets: [],
      fetchQ: false,
    })
  })
})
