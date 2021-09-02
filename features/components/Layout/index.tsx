import { ReactNode, FC } from "react"

import Head from "next/head"

import AppBar from "../AppBar"

import styles from "./Layout.module.css"

interface LayoutProps {
  title: string
  children: ReactNode
  isLoggedIn: boolean
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
        {hasPdf && <script key="hypothesis" src="https://hypothes.is/embed.js" async></script>}
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
