import React, { FC, MouseEventHandler } from "react"

import { Link } from "carbon-components-react"

export interface LogoutLinkProps {
  /**Callback to handle logout */
  handleLogout(): void
}

/**Logout link */
const LogoutLink: FC<LogoutLinkProps> = ({ handleLogout }) => {
  const onClick: MouseEventHandler<HTMLAnchorElement> = (event) => {
    event.preventDefault()
    handleLogout()
  }

  return (
    <Link href="/logout" size="lg" inline={false} onClick={onClick}>
      Log out
    </Link>
  )
}

export default LogoutLink
