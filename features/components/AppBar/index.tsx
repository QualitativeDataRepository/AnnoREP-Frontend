import { FC } from "react"

import { User, Login, Information } from "@carbon/react/icons"
import { Button, OverflowMenu, OverflowMenuItem } from "@carbon/react"
import { signOut } from "next-auth/react"

import { IAnnoRepUser } from "../../../types/auth"

import styles from "./AppBar.module.css"

export interface AppBarProps {
  /** Is the user logged in? */
  user: IAnnoRepUser | null
}

const AppBar: FC<AppBarProps> = ({ user }) => {
  const handleLogout = () => signOut({ redirect: true, callbackUrl: "/" })

  return (
    <div className={styles.container}>
      <header className={styles.header}>
        <Button className={styles.logo} size="md" kind="ghost" as="a" href="/">
          Anno<abbr>REP</abbr>
        </Button>
        <div className={styles.actions}>
          <Button
            className={styles.actionButton}
            hasIconOnly
            tooltipPosition="bottom"
            tooltipAlignment="center"
            iconDescription="Guide"
            size="lg"
            kind="ghost"
            as="a"
            href="/guide"
          >
            <Information />
          </Button>
          {user ? (
            <OverflowMenu
              flipped
              renderIcon={User}
              size="lg"
              className={styles.user}
              iconDescription=""
              menuOptionsClass={styles.menuOptions}
            >
              <OverflowMenuItem
                requireTitle
                itemText={user.dataverse.name}
                href={user.dataverse.link}
                {...({ target: "_blank", rel: "noopener noreferrer" } as any)}
              />
              <OverflowMenuItem
                requireTitle
                itemText={user.hypothesis.name}
                href={user.hypothesis.link}
                {...({ target: "_blank", rel: "noopener noreferrer" } as any)}
              />
              <OverflowMenuItem itemText="Log out" hasDivider onClick={handleLogout} />
            </OverflowMenu>
          ) : (
            <Button
              className={styles.actionButton}
              hasIconOnly
              tooltipPosition="bottom"
              tooltipAlignment="end"
              iconDescription="Login"
              size="lg"
              kind="ghost"
              as="a"
              href="/auth/login"
            >
              <Login />
            </Button>
          )}
        </div>
      </header>
    </div>
  )
}

export default AppBar
