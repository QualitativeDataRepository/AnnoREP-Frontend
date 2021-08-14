import { Dispatch, useEffect, useReducer } from "react"

import axios from "axios"

import { Action, searchReducer, SearchState } from "./state"

import { NUMBER_OF_ATI_PROJECTS_PER_PAGE } from "../../../constants/dataverse"
import { getMessageFromError } from "../../../utils/httpRequestUtils"

const useSearch = (inititalState: SearchState) => {
  const [state, dispatch] = useReducer(searchReducer, inititalState)

  useEffect(() => {
    const cursor = state.page * NUMBER_OF_ATI_PROJECTS_PER_PAGE
    let didCancel = false

    const search = async () => {
      try {
        dispatch({ type: "SEARCH_INIT" })
        const { data } = await axios.get(`/api/dataset-search`, {
          params: {
            start: cursor,
          },
        })
        if (!didCancel) {
          dispatch({ type: "SEARCH_SUCCESS", payload: data })
          setTimeout(() => dispatch({ type: "SEARCH_CLEAN_UP" }), 5000)
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
  }, [state.page, state.totalCount, state.currentTotal, state.atiProjects])

  return [state, dispatch] as [SearchState, Dispatch<Action>]
}

export default useSearch
