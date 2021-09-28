import { FC } from "react"

import Link from "next/link"

import { Add16 } from "@carbon/icons-react"
import { Button } from "carbon-components-react"

import styles from "./HomePageTitle.module.css"

/**The home page title when the user is logged in */
const HomePageTitle: FC = () => {
  return (
    <div className={styles.titleContainer}>
      <h1>
        <abbr>ATI</abbr> Projects
      </h1>
      <Link href="/new">
        <Button as="a" href="/new" kind="primary" size="md" renderIcon={Add16}>
          <span>
            New <abbr>ATI</abbr> Project
          </span>
        </Button>
      </Link>
    </div>
  )
}

export default HomePageTitle
