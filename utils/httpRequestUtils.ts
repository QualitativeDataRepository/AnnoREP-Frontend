import axios from "axios"
import { REQUEST_DESC_HEADER_NAME } from "../constants/http"
import { AnnoRepResponse } from "../types/http"

export const getResponseFromError = (e: unknown, requestDesc?: string): AnnoRepResponse => {
  const annoRepResponse: AnnoRepResponse = { status: 400, message: "" }
  if (axios.isAxiosError(e)) {
    let requestInfo = "Request"
    if (e.config && e.config.headers && e.config.headers[REQUEST_DESC_HEADER_NAME]) {
      requestInfo = e.config.headers[REQUEST_DESC_HEADER_NAME] as string
    } else if (requestDesc) {
      requestInfo = requestDesc
    } else if (e.config && e.config.method && e.config.url) {
      requestInfo = `${e.config.method} ${e.config.url}`
    }
    let failureMessage = `${requestInfo} failed.`
    if (e.response) {
      const additional =
        e.response.data.message ||
        e.response.data.reason ||
        `HTTP ${e.response.status} ${e.response.statusText}`
      failureMessage = `${additional}. ${failureMessage}`
    }
    annoRepResponse.status = e.response?.status || 400
    annoRepResponse.message = failureMessage
  } else if (e instanceof Error) {
    annoRepResponse.status = 400
    annoRepResponse.message = `${e.message}${requestDesc ? ` ${requestDesc} failed.` : ""}`
  } else {
    annoRepResponse.status = 400
    annoRepResponse.message = `Unknown error ${e}`
  }
  return annoRepResponse
}

export const getMessageFromError = (e: unknown): string => {
  let msg: string
  if (axios.isAxiosError(e)) {
    //All internal api endpoints returns a body with message field.
    msg = e.response?.data.message
  } else if (e instanceof Error) {
    msg = e.message
  } else {
    msg = `${e}`
  }
  return msg
}
