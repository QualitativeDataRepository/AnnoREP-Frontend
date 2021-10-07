import { ReactNode, FC } from "react"

import Head from "next/head"
import DOMPurify from "isomorphic-dompurify"

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
  return (
    <>
      <Head>
        <title>{title}</title>
        <meta charSet="utf-8" />
        <meta name="viewport" content="initial-scale=1.0, width=device-width" />
      </Head>
      {hasPdf && (
        <>
          <script
            type="application/json"
            className="js-hypothesis-config"
            dangerouslySetInnerHTML={{
              __html: DOMPurify.sanitize(JSON.stringify({ openSidebar: true })),
            }}
          ></script>
          <script async src="https://hypothes.is/embed.js"></script>
        </>
      )}
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
