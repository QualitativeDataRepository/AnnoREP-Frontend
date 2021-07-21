import axios, { AxiosError } from "axios"
import { REQUEST_DESC_HEADER_NAME } from "../constants/http"
import { AnnoRepResponse } from "../types/http"

export const getResponseFromError = (
  e: Error | AxiosError,
  requestDesc?: string
): AnnoRepResponse => {
  if (axios.isAxiosError(e)) {
    const requestInfo =
      e.config.headers[REQUEST_DESC_HEADER_NAME] || `${e.config.method} ${e.config.url}`
    let failureMessage = `${requestInfo} failed.`
    if (e.response) {
      const additional =
        e.response.data.message ||
        e.response.data.reason ||
        `HTTP ${e.response.status} ${e.response.statusText}`
      failureMessage = `${additional}. ${failureMessage}`
    }
    return {
      status: e.response?.status || 400,
      message: failureMessage,
    }
  } else {
    return {
      status: 400,
      message: `${e.message}${requestDesc ? ` ${requestDesc} failed.` : ""}`,
    }
  }
}

export const getMessageFromError = (e: Error | AxiosError): string => {
  if (axios.isAxiosError(e)) {
    //All internal api endpoints returns a body with message field.
    return e.response?.data.message
  } else {
    return e.message
  }
}