import { ReactNode, FC, useEffect } from "react"

import DOMPurify from "isomorphic-dompurify"
import Head from "next/head"

import AppBar from "../AppBar"

import { IAnnoRepUser } from "../../../types/auth"

import styles from "./Layout.module.css"

interface LayoutProps {
  title: string
  children: ReactNode
  user: IAnnoRepUser | null
  isFullWidth?: boolean
  hasPdf?: boolean
}

const Layout: FC<LayoutProps> = ({ title, children, user, isFullWidth, hasPdf }) => {
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
        <meta name="description" content="Restructure, Edit, and Publish annotations" />
        <meta charSet="utf-8" />
        <meta name="viewport" content="initial-scale=1.0, width=device-width" />
        <link rel="apple-touch-icon" sizes="180x180" href="/apple-touch-icon.png" />
        <link rel="icon" type="image/png" sizes="32x32" href="/favicon-32x32.png" />
        <link rel="icon" type="image/png" sizes="16x16" href="/favicon-16x16.png" />
        <link rel="manifest" href="/site.webmanifest" />
        <link rel="mask-icon" href="/safari-pinned-tab.svg" color="#5bbad5" />
        <meta name="msapplication-TileColor" content="#da532c" />
        <meta name="theme-color" content="#ffffff" />
      </Head>
      <div className={styles.container}>
        <AppBar user={user} />
        <main className={`${styles.main} ${isFullWidth ? styles.fullMaxWidth : styles.maxWidth}`}>
          {children}
        </main>
      </div>
    </>
  )
}

export default Layout
