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
    <div>
      <Head>
        <title>{title}</title>
      </Head>
      <div className={styles.container}>
        <AppBar />
        <main className={`${styles.main} ${isFullWidth ? styles.fullmaxwidth : styles.maxwidth}`}>
          {children}
        </main>
      </div>
    </div>
  )
}

export default Layout
