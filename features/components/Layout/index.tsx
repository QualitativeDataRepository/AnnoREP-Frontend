import { ReactNode, FC, useEffect } from "react"

import DOMPurify from "isomorphic-dompurify"
import Head from "next/head"

import AppBar from "../AppBar"

import styles from "./Layout.module.css"

interface LayoutProps {
  title: string
  children: ReactNode
  isLoggedIn?: boolean
  isFullWidth?: boolean
  hasPdf?: boolean
}

const Layout: FC<LayoutProps> = ({ title, children, isLoggedIn, isFullWidth, hasPdf }) => {
  useEffect(() => {
    if (hasPdf) {
      const hClientConfig = document.createElement("script")
      hClientConfig.type = "application/json"
      hClientConfig.className = "js-hypothesis-config"
      hClientConfig.innerHTML = DOMPurify.sanitize(JSON.stringify({ openSidebar: true }))
      const hClient = document.createElement("script")
      hClient.src = "https://hypothes.is/embed.js"
      hClient.async = true
      document.head.appendChild(hClientConfig)
      document.head.appendChild(hClient)
    }
  }, [hasPdf])

  return (
    <>
      <Head>
        <title>{title}</title>
        <meta charSet="utf-8" />
        <meta name="viewport" content="initial-scale=1.0, width=device-width" />
      </Head>
      <div className={styles.container}>
        <AppBar isLoggedIn={isLoggedIn} />
        <main className={`${styles.main} ${isFullWidth ? styles.fullMaxWidth : styles.maxWidth}`}>
          {children}
        </main>
      </div>
    </>
  )
}

export default Layout
