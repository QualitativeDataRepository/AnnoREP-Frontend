import { FC } from "react"

import { Link } from "carbon-components-react"
import { signOut } from "next-auth/client"

import LoginLink from "../../auth/LoginLink"
import LogoutLink from "../../auth/LogoutLink"

import styles from "./AppBar.module.css"

export interface AppBarProps {
  /** Is the user logged in? */
  isLoggedIn?: boolean
}

const AppBar: FC<AppBarProps> = ({ isLoggedIn }) => {
  const handleLougout = () => signOut()
  return (
    <nav className={styles.container}>
      <a href="/" className={styles.logoLink}>
        AnnoREP
      </a>
      <div className={styles.links}>
        <Link size="lg" href="/guide">
          Guide
        </Link>
        {isLoggedIn !== undefined && (
          <>{isLoggedIn ? <LogoutLink handleLogout={handleLougout} /> : <LoginLink />}</>
        )}
      </div>
    </nav>
  )
}

export default AppBar
