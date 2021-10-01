import { Dispatch, useEffect, useReducer } from "react"

import axios from "axios"
import qs from "qs"

import { Action, searchReducer, SearchState } from "./state"
import { getTrueFields } from "./utils"

import { PUBLICATION_STATUSES } from "../../../constants/dataverse"
import { getMessageFromError } from "../../../utils/httpRequestUtils"

const useSearch = (inititalState: SearchState): [SearchState, Dispatch<Action>] => {
  const [state, dispatch] = useReducer(searchReducer, inititalState)

  useEffect(() => {
    let didCancel = false

    const search = async () => {
      try {
        dispatch({ type: "SEARCH_INIT" })
        //if search q use all the publication statuses, else use the selected publication statuses
        const publicationStatuses = state.fetchQ
          ? PUBLICATION_STATUSES
          : getTrueFields(state.selectedPublicationStatuses)
        const { data } = await axios.get(`/api/mydata-search`, {
          params: {
            publicationStatuses,
            q: state.q,
            //dataverse mydata selected_page starts at 1
            //if search page then use state.page, else start at the beginning
            selectedPage: state.fetchPage ? state.page + 1 : 1,
            isAnnoRep: true,
          },
          paramsSerializer: (params) => {
            return qs.stringify(params, { indices: false })
          },
        })
        if (!didCancel) {
          const actionType = state.fetchPage ? "SEARCH_PAGE" : "SEARCH_Q"
          dispatch({ type: actionType, payload: data })
        }
      } catch (e) {
        if (!didCancel) {
          const message = getMessageFromError(e)
          dispatch({ type: "SEARCH_FAILURE", payload: message })
          dispatch({ type: "NO_RESULTS" })
        }
      }
    }

    if (state.fetchPage || state.fetchQ || state.fetchPublicationStatus) {
      search()
    }

    return () => {
      didCancel = true
    }
  }, [
    state.q,
    state.fetchQ,
    state.page,
    state.fetchPage,
    state.selectedPublicationStatuses,
    state.fetchPublicationStatus,
  ])

  return [state, dispatch]
}

export default useSearch
