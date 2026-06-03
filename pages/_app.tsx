import { useEffect } from "react"
import type { AppProps } from "next/app"
import { SessionProvider } from "next-auth/react"

import { init } from "../features/analytics/matomo"

import "../styles/globals.css"
import "@carbon/styles/css/styles.css"

const MATOMO_URL = process.env.NEXT_PUBLIC_MATOMO_URL
const MATOMO_SITE_ID = process.env.NEXT_PUBLIC_MATOMO_SITE_ID

function MyApp({ Component, pageProps }: AppProps): JSX.Element {
  useEffect(() => {
    init({ url: MATOMO_URL as string, siteId: MATOMO_SITE_ID as string })
  }, [])
  return (
    <SessionProvider session={pageProps.session}>
      <Component {...pageProps} />
    </SessionProvider>
  )
}

export default MyApp
