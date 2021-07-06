import { ReactNode, FC } from "react"

import Head from "next/head"

import AppBar from "../AppBar"

import styles from "./Layout.module.css"

interface LayoutProps {
  title: string
  children: ReactNode
  isFullWidth?: boolean
}

const Layout: FC<LayoutProps> = ({ title, children, isFullWidth }) => {
  return (
    <>
      <Head>
        <title>{title}</title>
        <meta charSet="utf-8" />
        <meta name="viewport" content="initial-scale=1.0, width=device-width" />
      </Head>
      <div className={styles.container}>
        <AppBar />
        <main className={`${styles.main} ${isFullWidth ? styles.fullmaxwidth : styles.maxwidth}`}>
          {children}
        </main>
      </div>
    </>
  )
}

export default Layout