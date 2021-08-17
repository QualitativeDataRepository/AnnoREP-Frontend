import { Dispatch, useEffect, useReducer } from "react"

import axios from "axios"
import qs from "qs"

import { Action, searchReducer, SearchState } from "./state"
import { getTrueFields } from "./utils"

import { PUBLICATION_STATUSES } from "../../../constants/dataverse"
import { getMessageFromError } from "../../../utils/httpRequestUtils"

const useSearch = (inititalState: SearchState) => {
  const [state, dispatch] = useReducer(searchReducer, inititalState)

  //Change pages
  useEffect(() => {
    const cursor = state.page * state.perPage
    let didCancel = false

    const search = async () => {
      try {
        dispatch({ type: "SEARCH_INIT" })
        const { data } = await axios.get(`/api/mydata-search`, {
          params: {
            q: state.q,
            //dataverse mydata selected_page starts at 1
            selectedPage: state.page + 1,
            isAnnoRep: true,
            //use current pub statuses
            publicationStatuses: getTrueFields(state.selectedPublicationStatuses),
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

    if (state.currentTotal < state.totalCount && !(cursor in state.atiProjects)) {
      search()
    }

    return () => {
      didCancel = true
    }
  }, [
    state.q,
    state.page,
    state.totalCount,
    state.currentTotal,
    state.atiProjects,
    state.selectedPublicationStatuses,
  ])

  //Searching q
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
            isAnnoRep: true,
            //when searching q, search all pub statuses
            publicationStatuses: PUBLICATION_STATUSES,
          },
          paramsSerializer: (params) => {
            return qs.stringify(params, { indices: false })
          },
        })
        if (!didCancel) {
          dispatch({ type: "SEARCH_Q", payload: data })
          dispatch({ type: "UPDATE_FETCH_Q" })
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
      //Don't initially search q
      search()
    }
    return () => {
      didCancel = true
    }
  }, [state.q, state.fetchQ])

  //Publication status change
  useEffect(() => {
    let didCancel = false
    const publicationStatuses = getTrueFields(state.selectedPublicationStatuses)
    const search = async () => {
      try {
        dispatch({ type: "SEARCH_INIT" })
        const { data } = await axios.get(`/api/mydata-search`, {
          params: {
            q: state.q,
            //dataverse mydata selected_page starts at 1
            selectedPage: 1,
            isAnnoRep: true,
            publicationStatuses: publicationStatuses,
          },
          paramsSerializer: (params) => {
            return qs.stringify(params, { indices: false })
          },
        })
        if (!didCancel) {
          dispatch({ type: "SEARCH_Q", payload: data })
          dispatch({ type: "UPDATE_FETCH_PUBLICATION_STATUS" })
        }
      } catch (e) {
        if (!didCancel) {
          const message = getMessageFromError(e)
          dispatch({ type: "SEARCH_FAILURE", payload: message })
          dispatch({ type: "NO_RESULTS" })
        }
      }
    }
    if (state.fetchPublicationStatus) {
      search()
    }
    return () => {
      didCancel = true
    }
  }, [state.q, state.selectedPublicationStatuses, state.fetchPublicationStatus])

  return [state, dispatch] as [SearchState, Dispatch<Action>]
}

export default useSearch
