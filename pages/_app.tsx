import { useEffect } from "react"
import type { AppProps } from "next/app"
import { Provider } from "next-auth/client"

import init from "../features/analytics/matomo"

import "../styles/globals.css"
import "carbon-components/css/carbon-components.min.css"

function MyApp({ Component, pageProps }: AppProps): JSX.Element {
  useEffect(() => {
    init({ url: "https://tnhar.matomo.cloud/", siteId: "1" })
  }, [])
  return (
    <Provider session={pageProps.session}>
      <Component {...pageProps} />
    </Provider>
  )
}

export default MyApp
