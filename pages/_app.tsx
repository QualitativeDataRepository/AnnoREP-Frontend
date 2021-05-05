import type { AppProps } from "next/app"
import "../styles/globals.css"
import "carbon-components/css/carbon-components.css"

function MyApp({ Component, pageProps }: AppProps): JSX.Element {
  return <Component {...pageProps} />
}

export default MyApp
