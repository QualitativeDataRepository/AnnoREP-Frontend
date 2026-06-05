import { FC } from "react"

import Link from "next/link"

import { Add } from "@carbon/react/icons"
import { Button } from "@carbon/react"

import styles from "./HomePageTitle.module.css"

/**The home page title when the user is logged in */
const HomePageTitle: FC = () => {
  return (
    <div className={styles.titleContainer}>
      <h1>
        <abbr>ATI</abbr> Projects
      </h1>
      <Link href="/new" passHref legacyBehavior>
        <Button as="a" kind="primary" size="md" renderIcon={Add}>
          <span>
            New <abbr>ATI</abbr> Project
          </span>
        </Button>
      </Link>
    </div>
  )
}

export default HomePageTitle
