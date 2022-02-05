import { searchReducer, ISearchState, SearchActionType } from "../state"

describe("searchReducer", () => {
  const initialState: ISearchState = {
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
    expect(searchReducer(initialState, { type: SearchActionType.SEARCH_INIT })).toEqual({
      ...initialState,
      status: "active",
    })
  })

  test("handles failure", () => {
    expect(
      searchReducer(initialState, { type: SearchActionType.SEARCH_FAILURE, payload: "error" })
    ).toEqual({
      ...initialState,
      status: "error",
      error: "error",
    })
  })

  test("handles update page and should fetch projects", () => {
    expect(searchReducer(initialState, { type: SearchActionType.UPDATE_PAGE, payload: 1 })).toEqual(
      {
        ...initialState,
        page: 1,
        fetchPage: true,
      }
    )
  })

  test("handles update page and shouldn't fetch projects", () => {
    expect(searchReducer(initialState, { type: SearchActionType.UPDATE_PAGE, payload: 0 })).toEqual(
      {
        ...initialState,
        page: 0,
        fetchPage: false,
      }
    )
  })

  test("handles search page", () => {
    expect(
      searchReducer(initialState, {
        type: SearchActionType.SEARCH_PAGE,
        payload: {
          datasets: [
            {
              id: "ati-2",
              name: "Ati 2",
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
          start: 1,
          totalCount: 2,
          docsPerPage: 1,
          selectedFilters: {},
          publicationStatusCount: {},
        },
      })
    ).toEqual({
      ...initialState,
      status: "finished",
      currentTotal: 2,
      atiProjects: {
        ...initialState.atiProjects,
        1: {
          id: "ati-2",
          name: "Ati 2",
          description: "",
          citationHtml: "",
          dataverse: "",
          dataverseName: "",
          dataverseServerUrl: "",
          dateDisplay: "",
          publicationStatuses: [] as string[],
          userRoles: [] as string[],
        },
      },
    })
  })

  test("handles update q", () => {
    expect(searchReducer(initialState, { type: SearchActionType.UPDATE_Q, payload: "q" })).toEqual({
      ...initialState,
      q: "q",
      fetchQ: true,
    })
  })

  test("handles search q", () => {
    expect(
      searchReducer(initialState, {
        type: SearchActionType.SEARCH_Q,
        payload: {
          totalCount: 2,
          start: 0,
          docsPerPage: 1,
          datasets: [
            {
              id: "ati-2",
              name: "Ati 2",
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
          selectedFilters: {
            publication_statuses: ["Draft"],
          },
          publicationStatusCount: {
            draft_count: 1,
          },
        },
      })
    ).toEqual({
      ...initialState,
      status: "finished",
      totalCount: 2,
      currentTotal: 1,
      atiProjects: {
        0: {
          id: "ati-2",
          name: "Ati 2",
          description: "",
          citationHtml: "",
          dataverse: "",
          dataverseName: "",
          dataverseServerUrl: "",
          dateDisplay: "",
          publicationStatuses: [] as string[],
          userRoles: [] as string[],
        },
      },
      page: 0,
      perPage: 1,
      selectedPublicationStatuses: { Draft: true },
      selectedFilters: {
        publication_statuses: ["Draft"],
      },
      publicationStatusCount: {
        draft_count: 1,
      },
      fetchQ: false,
      fetchPublicationStatus: false,
    })
  })

  test("handles update publication statuses - true", () => {
    expect(
      searchReducer(initialState, {
        type: SearchActionType.UPDATE_SELECTED_PUBLICATION_STATUS,
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

  test("handles update publication statuses - false", () => {
    expect(
      searchReducer(initialState, {
        type: SearchActionType.UPDATE_SELECTED_PUBLICATION_STATUS,
        payload: {
          id: "Draft",
          checked: false,
        },
      })
    ).toEqual({
      ...initialState,
      fetchPublicationStatus: true,
      selectedPublicationStatuses: {
        Draft: false,
      },
    })
  })

  test("handles no results", () => {
    expect(searchReducer(initialState, { type: SearchActionType.NO_RESULTS })).toEqual({
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
