import React, { FC } from "react"

import Link from "next/link"

import "carbon-components/css/carbon-components.min.css"

const DATAVERSE_LOGIN_PATH = "/user/dataverse-login"

/**Dataverse Login Link */
const LoginLink: FC = () => {
  return (
    <Link href={DATAVERSE_LOGIN_PATH}>
      <a className="bx--link bx--link--lg" href={DATAVERSE_LOGIN_PATH}>
        Log in (Dataverse)
      </a>
    </Link>
  )
}

export default LoginLink
