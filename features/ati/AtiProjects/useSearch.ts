import { Dispatch, useEffect, useReducer } from "react"

import axios from "axios"

import { Action, searchReducer, SearchState } from "./state"

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
            //pub status
          },
        })
        if (!didCancel) {
          dispatch({ type: "SEARCH_SUCCESS", payload: data })
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
  }, [state.q, state.page, state.totalCount, state.currentTotal, state.atiProjects])

  //Searching
  useEffect(() => {
    const didCancel = false
    const search = async () => {
      try {
        dispatch({ type: "SEARCH_INIT" })
        const { data } = await axios.get(`/api/mydata-search`, {
          params: {
            q: state.q,
            //dataverse mydata selected_page starts at 1
            selectedPage: 1,
            isAnnoRep: true,
            //pub status
          },
        })
        if (!didCancel) {
          dispatch({ type: "SEARCH_Q", payload: data })
        }
      } catch (e) {
        if (!didCancel) {
          const message = getMessageFromError(e)
          dispatch({ type: "SEARCH_FAILURE", payload: message })
        }
      }
    }
    if (state.fetchQ) {
      //Don't initially search q
      search()
    }
  }, [state.q, state.fetchQ])

  return [state, dispatch] as [SearchState, Dispatch<Action>]
}

export default useSearch
