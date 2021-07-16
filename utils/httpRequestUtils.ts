export const errorWrapper = (reason: string) => (error: any) => {
  throw new Error(`${reason}. ${error.message}`)
}

export const requestWrapper = (
  successStatus: number,
  status: number,
  req: Promise<any>,
  failure: string
) => {
  if (status === successStatus) {
    return req
  } else {
    throw new Error(`Request status: ${status}. ${failure}`)
  }
}

export const errorMsgHelper = (error: any) => {
  if (error.response) {
    return error.response.data.message
  } else if (error.request) {
    return error.request
  } else if (error.message) {
    return error.message
  } else {
    return `${error}`
  }
}
