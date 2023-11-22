import { useEffect } from "react"
import type { AppProps } from "next/app"
import { Provider } from "next-auth/react"

import { init } from "../features/analytics/matomo"

import "../styles/globals.css"
import "carbon-components/css/carbon-components.min.css"

const MATOMO_URL = process.env.NEXT_PUBLIC_MATOMO_URL
const MATOMO_SITE_ID = process.env.NEXT_PUBLIC_MATOMO_SITE_ID

function MyApp({ Component, pageProps }: AppProps): JSX.Element {
  useEffect(() => {
    init({ url: MATOMO_URL as string, siteId: MATOMO_SITE_ID as string })
  }, [])
  return (
    <Provider session={pageProps.session}>
      <Component {...pageProps} />
    </Provider>
  )
}

export default MyApp
