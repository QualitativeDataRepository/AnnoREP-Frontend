import { Dispatch, useEffect, useReducer } from "react"

import axios from "axios"
import qs from "qs"

import { SearchDatasetAction, searchDatasetReducer, SearchDatasetState } from "./state"

import { getMessageFromError } from "../../../utils/httpRequestUtils"
import { PUBLICATION_STATUSES } from "../../../constants/dataverse"

const useSearchDataset = (
  inititalState: SearchDatasetState
): [SearchDatasetState, Dispatch<SearchDatasetAction>] => {
  const [state, dispatch] = useReducer(searchDatasetReducer, inititalState)

  //add more pages
  useEffect(() => {
    let didCancel = false

    const search = async () => {
      try {
        dispatch({ type: "SEARCH_INIT" })
        const { data } = await axios.get(`/api/mydata-search`, {
          params: {
            q: state.q,
            //dataverse mydata selected_page starts at 1
            selectedPage: state.page + 1,
            isAnnoRep: false,
            publicationStatuses: PUBLICATION_STATUSES,
          },
          paramsSerializer: (params) => {
            return qs.stringify(params, { indices: false })
          },
        })
        if (!didCancel) {
          dispatch({ type: "SEARCH_PAGE", payload: data })
        }
      } catch (e) {
        if (!didCancel) {
          const message = getMessageFromError(e)
          dispatch({ type: "SEARCH_FAILURE", payload: message })
        }
      }
    }

    if (state.currentTotal < state.totalCount && state.fetchPage) {
      search()
    }

    return () => {
      didCancel = true
    }
  }, [state.q, state.page, state.fetchPage, state.totalCount, state.currentTotal])

  //search q
  useEffect(() => {
    let didCancel = false

    const search = async () => {
      try {
        dispatch({ type: "SEARCH_INIT" })
        const { data } = await axios.get(`/api/mydata-search`, {
          params: {
            q: state.q,
            //dataverse mydata selected_page starts at 1
            selectedPage: 1,
            isAnnoRep: false,
            publicationStatuses: PUBLICATION_STATUSES,
          },
          paramsSerializer: (params) => {
            return qs.stringify(params, { indices: false })
          },
        })
        if (!didCancel) {
          dispatch({ type: "SEARCH_Q", payload: data })
        }
      } catch (e) {
        if (!didCancel) {
          const message = getMessageFromError(e)
          dispatch({ type: "SEARCH_FAILURE", payload: message })
          dispatch({ type: "NO_RESULTS" })
        }
      }
    }

    if (state.fetchQ) {
      search()
    }

    return () => {
      didCancel = true
    }
  }, [state.q, state.fetchQ])

  return [state, dispatch]
}

export default useSearchDataset
