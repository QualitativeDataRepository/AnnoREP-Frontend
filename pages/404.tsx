import ErrorContainer from "../features/error/ErrorContainer"

export default function Custom404(): JSX.Element {
  return <ErrorContainer error={`404: Page Not Found`} />
}
