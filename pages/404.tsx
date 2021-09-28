import ErrorContainer from "../features/error/ErrorContainer"

export default function Custom404() {
  return <ErrorContainer error={`404: Page Not Found`} />
}
