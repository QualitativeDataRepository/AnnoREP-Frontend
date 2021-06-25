//app bar with logo or signin signout
import { FC } from "react"

import { signOut, useSession } from "next-auth/client"
import Link from "next/link"

import LoginLink from "../../dataverse-auth/LoginLink"
import LogoutLink from "../../dataverse-auth/LogoutLink"

import styles from "./AppBar.module.css"

//use carbon app shell, or darken bg
const AppBar: FC = () => {
  const [session] = useSession()
  const handleLougout = () => signOut()
  return (
    <div className={styles.container}>
      <Link href="/">
        <div className={styles.logolink}>AnnoREP</div>
      </Link>
      {session ? <LogoutLink handleLogout={handleLougout} /> : <LoginLink />}
    </div>
  )
}

export default AppBar
