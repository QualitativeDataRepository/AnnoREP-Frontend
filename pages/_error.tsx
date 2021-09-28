import http from "http"

import { NextPageContext } from "next"

import ErrorContainer from "../features/error/ErrorContainer"

interface ErrorProps {
  error: string
}

const Error = ({ error }: ErrorProps) => {
  return <ErrorContainer error={error} />
}

Error.getInitialProps = ({ res, err }: NextPageContext) => {
  const statusCode = (res ? res.statusCode : err ? err.statusCode : 404) || 500
  const message = http.STATUS_CODES[statusCode]
  return { error: `${statusCode}: ${message}` }
}

export default Error
