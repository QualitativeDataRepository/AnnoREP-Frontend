import { FC } from "react"

import { signOut } from "next-auth/client"
import Link from "next/link"

import LoginLink from "../../dataverse-auth/LoginLink"
import LogoutLink from "../../dataverse-auth/LogoutLink"

import styles from "./AppBar.module.css"

interface AppBarProps {
  isLoggedIn: boolean
}

const AppBar: FC<AppBarProps> = ({ isLoggedIn }) => {
  const handleLougout = () => signOut()
  return (
    <div className={styles.container}>
      <Link href="/">
        <div className={styles.logolink}>AnnoREP</div>
      </Link>
      {isLoggedIn ? <LogoutLink handleLogout={handleLougout} /> : <LoginLink />}
    </div>
  )
}

export default AppBar
