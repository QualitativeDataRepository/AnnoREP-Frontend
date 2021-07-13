export const errorWrapper = (reason: string) => (error: any) => {
  throw new Error(`${reason}. ${error}`)
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
