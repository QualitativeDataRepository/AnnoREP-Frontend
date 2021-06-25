import type { AppProps } from "next/app"
import { Provider } from "next-auth/client"

import "../styles/globals.css"
import "carbon-components/css/carbon-components.min.css"

import { initializeIcons } from "@fluentui/react"
initializeIcons()

function MyApp({ Component, pageProps }: AppProps): JSX.Element {
  return (
    <Provider session={pageProps.session}>
      <Component {...pageProps} />
    </Provider>
  )
}

export default MyApp
