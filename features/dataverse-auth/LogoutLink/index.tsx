import React, { FC, MouseEventHandler } from "react"

import { Link } from "carbon-components-react"
import "carbon-components/css/carbon-components.min.css"

export interface LogoutLinkProps {
  /**Callback to handle dataverse logout */
  handleLogout(): void
}

/**Dataverse logout link */
const LogoutLink: FC<LogoutLinkProps> = ({ handleLogout }) => {
  const onClick: MouseEventHandler<HTMLAnchorElement> = (event) => {
    event.preventDefault()
    handleLogout()
  }

  return (
    <Link href="/dataverse-logout" size="lg" inline={false} onClick={onClick}>
      Log out
    </Link>
  )
}

export default LogoutLink
