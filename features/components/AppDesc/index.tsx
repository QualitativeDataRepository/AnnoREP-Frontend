import { FC } from "react"
import { ArrowRight, Launch } from "@carbon/react/icons"
import { Button } from "@carbon/react"

import styles from "./AppDesc.module.css"

export interface AppDescProps {
  isLoggedIn: boolean
}

/** A brief summary of the app for when the user is not logged in */
const AppDesc: FC<AppDescProps> = ({ isLoggedIn }) => {
  return (
    <div className={styles.container}>
      <p className={styles.leadspaceText}>
        <strong>AnnoREP</strong> is an open-source, web-based tool that will help facilitate
        Annotation for Transparent Inquiry (<abbr>ATI</abbr>) and other annotation-based workflows.
      </p>
      <div className={styles.buttonContainer}>
        <Button
          as="a"
          href="https://qdr.syr.edu/ati"
          target="_blank"
          rel="noopener noreferrer"
          kind="tertiary"
          renderIcon={Launch}
        >
          Learn more about ATI
        </Button>
        <Button
          as="a"
          href={isLoggedIn ? "/new" : "/auth/login"}
          kind="primary"
          renderIcon={ArrowRight}
        >
          {isLoggedIn ? "Create a new ATI project" : "Login to create a new ATI project"}
        </Button>
      </div>
    </div>
  )
}

export default AppDesc
