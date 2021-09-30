import { searchReducer, SearchState } from "../state"

describe("searchReducer", () => {
  const initialState: SearchState = {
    totalCount: 2,
    currentTotal: 1,
    atiProjects: {
      0: {
        id: "ati-id",
        name: "Ati",
        description: "Desc",
        citationHtml: "Citation HTML",
        dataverseName: "Dataverse name",
        dataverse: "main",
        dataverseServerUrl: "Server url",
        dateDisplay: "Date display",
        publicationStatuses: ["Draft", "Unpublished"],
        userRoles: ["Contributor"],
      },
    },
    status: "inactive",
    page: 0,
    fetchPage: false,
    perPage: 1,
    q: "",
    fetchQ: false,
    error: "",
    selectedPublicationStatuses: {},
    selectedFilters: {},
    publicationStatusCount: {},
    fetchPublicationStatus: false,
  }

  test("handles init", () => {
    expect(searchReducer(initialState, { type: "SEARCH_INIT" })).toEqual({
      ...initialState,
      status: "active",
    })
  })

  test("handles failure", () => {
    expect(searchReducer(initialState, { type: "SEARCH_FAILURE", payload: "error" })).toEqual({
      ...initialState,
      status: "error",
      error: "error",
    })
  })

  test("handles update page and should fetch projects", () => {
    expect(searchReducer(initialState, { type: "UPDATE_PAGE", payload: 1 })).toEqual({
      ...initialState,
      page: 1,
      fetchPage: true,
    })
  })

  test("handles update page and shouldn't fetch projects", () => {
    expect(searchReducer(initialState, { type: "UPDATE_PAGE", payload: 0 })).toEqual({
      ...initialState,
      page: 0,
      fetchPage: false,
    })
  })

  test("handles search page", () => {
    expect(
      searchReducer(initialState, {
        type: "SEARCH_PAGE",
        payload: { datasets: [{ id: "ati-2", name: "Ati 2" }], start: 1 },
      })
    ).toEqual({
      ...initialState,
      status: "finished",
      currentTotal: 2,
      atiProjects: { ...initialState.atiProjects, 1: { id: "ati-2", name: "Ati 2" } },
    })
  })

  test("handles update q", () => {
    expect(searchReducer(initialState, { type: "UPDATE_Q", payload: "q" })).toEqual({
      ...initialState,
      q: "q",
      fetchQ: true,
    })
  })

  test("handles search q", () => {
    expect(
      searchReducer(initialState, {
        type: "SEARCH_Q",
        payload: {
          totalCount: 2,
          docsPerPage: 2,
          datasets: [{ id: "ati-2", name: "Ati 2" }],
          selectedFilters: {},
          publicationStatusCount: {},
        },
      })
    ).toEqual({
      ...initialState,
      status: "finished",
      totalCount: 2,
      currentTotal: 1,
      atiProjects: { 0: { id: "ati-2", name: "Ati 2" } },
      page: 0,
      perPage: 2,
      selectedPublicationStatuses: {},
      selectedFilters: {},
      publicationStatusCount: {},
      fetchQ: false,
      fetchPublicationStatus: false,
    })
  })

  test("handles update publication statuses", () => {
    expect(
      searchReducer(initialState, {
        type: "UPDATE_SELECTED_PUBLICATION_STATUS",
        payload: {
          id: "Draft",
          checked: true,
        },
      })
    ).toEqual({
      ...initialState,
      fetchPublicationStatus: true,
      selectedPublicationStatuses: {
        Draft: true,
      },
    })
  })

  test("handles no results", () => {
    expect(searchReducer(initialState, { type: "NO_RESULTS" })).toEqual({
      ...initialState,
      totalCount: 0,
      currentTotal: 0,
      atiProjects: {},
      fetchPage: false,
      fetchQ: false,
      fetchPublicationStatus: false,
    })
  })
})
