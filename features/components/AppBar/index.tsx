import { FC } from "react"

import { signOut } from "next-auth/client"
import Link from "next/link"

import LoginLink from "../../auth/LoginLink"
import LogoutLink from "../../auth/LogoutLink"

import styles from "./AppBar.module.css"

interface AppBarProps {
  isLoggedIn: boolean
}

const AppBar: FC<AppBarProps> = ({ isLoggedIn }) => {
  const handleLougout = () => signOut()
  return (
    <nav className={styles.container}>
      <Link href="/">
        <a href="/" className={styles.logoLink}>
          AnnoREP
        </a>
      </Link>
      {isLoggedIn ? <LogoutLink handleLogout={handleLougout} /> : <LoginLink />}
    </nav>
  )
}

export default AppBar
