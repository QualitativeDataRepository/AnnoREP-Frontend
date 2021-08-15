import { Dispatch, useEffect, useReducer } from "react"

import axios from "axios"

import { Action, INITIAL_Q, searchReducer, SearchState } from "./state"

import { NUMBER_OF_ATI_PROJECTS_PER_PAGE } from "../../../constants/dataverse"
import { getMessageFromError } from "../../../utils/httpRequestUtils"

//10 secs
const TIMEOUT = 10000

const useSearch = (inititalState: SearchState) => {
  const [state, dispatch] = useReducer(searchReducer, inititalState)

  //Change pages
  useEffect(() => {
    const cursor = state.page * NUMBER_OF_ATI_PROJECTS_PER_PAGE
    let didCancel = false

    const search = async () => {
      try {
        dispatch({ type: "SEARCH_INIT" })
        const { data } = await axios.get(`/api/dataset-search`, {
          params: {
            q: state.q,
            start: cursor,
          },
        })
        if (!didCancel) {
          dispatch({ type: "SEARCH_SUCCESS", payload: data })
          setTimeout(() => dispatch({ type: "SEARCH_CLEAN_UP" }), TIMEOUT)
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
        const { data } = await axios.get(`/api/dataset-search`, {
          params: {
            q: state.q,
            start: 0,
          },
        })
        if (!didCancel) {
          dispatch({ type: "SEARCH_Q", payload: data })
          if (data.responseCount > 0) {
            setTimeout(() => dispatch({ type: "SEARCH_CLEAN_UP" }), TIMEOUT)
          }
        }
      } catch (e) {
        if (!didCancel) {
          const message = getMessageFromError(e)
          dispatch({ type: "SEARCH_FAILURE", payload: message })
        }
      }
    }
    if (state.q !== INITIAL_Q) {
      //Don't initially search q
      search()
    }
  }, [state.q])

  return [state, dispatch] as [SearchState, Dispatch<Action>]
}

export default useSearch
