import { default as Router } from "next/router"

declare global {
  interface Window {
    _paq: string[][]
  }
}

interface InitSettings {
  url: string
  siteId: string
  jsTrackerFile?: string
  phpTrackerFile?: string
}

function push(args: string[]): void {
  if (!window._paq) {
    window._paq = []
  }
  window._paq.push(args)
}

export function init({
  url,
  siteId,
  jsTrackerFile = "matomo.js",
  phpTrackerFile = "matomo.php",
}: InitSettings): void {
  window._paq = window._paq !== null ? window._paq : []
  if (!url) {
    console.warn("Matomo disabled, please provide matomo url")
    return
  }
  if (!siteId) {
    console.warn("Matomo disabled, please provide site id")
    return
  }

  push(["trackPageView"])
  push(["enableLinkTracking"])
  push(["setTrackerUrl", `${url}/${phpTrackerFile}`])
  push(["setSiteId", siteId])

  const scriptElement = document.createElement("script")
  const refElement = document.getElementsByTagName("script")[0]
  scriptElement.type = "text/javascript"
  scriptElement.async = true
  scriptElement.src = `${url}/${jsTrackerFile}`
  if (refElement.parentNode) {
    refElement.parentNode.insertBefore(scriptElement, refElement)
  }

  //start with location.pathname
  //when user navigate the site, use Router.pathname
  let previousPathname = location.pathname

  Router.events.on("routeChangeStart", (path: string): void => {
    //just the pathname
    console.warn("routeChangeStart", path)
    const [pathname] = path.split("?")

    if (previousPathname) {
      push(["setReferrerUrl", previousPathname])
    }
    push(["setCustomUrl", pathname]) //need the full url without query
    push(["deleteCustomVariables", "page"])
    previousPathname = pathname
  })

  Router.events.on("routeChangeComplete", (): void => {
    // In order to ensure that the page title had been updated,
    // we delayed pushing the tracking to the next tick.
    setTimeout(() => {
      push(["setDocumentTitle", document.title])
      push(["trackPageView"])
    }, 0)
  })
}
