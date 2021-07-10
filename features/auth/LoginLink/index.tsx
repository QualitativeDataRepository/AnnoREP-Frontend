import React, { FC } from "react"

import Link from "next/link"

const LOGIN_PATH = "/auth/login"

/**Login Link */
const LoginLink: FC = () => {
  return (
    <Link href={LOGIN_PATH}>
      <a className="bx--link bx--link--lg" href={LOGIN_PATH}>
        Log in
      </a>
    </Link>
  )
}

export default LoginLink
