import { FC } from "react"

import styles from "./AppDesc.module.css"

/** A brief summary of the app for when the user is not logged in */
const AppDesc: FC = () => {
  return (
    <div className={styles.callout}>
      <h1>About</h1>
      <p>
        AnnoREP is an open-source, web-based tool that will help facilitate{" "}
        <a href={"https://qdr.syr.edu/ati"}>Annotation for Transprent Inquiry (ATI)</a> and other
        annotation-based workflows.
      </p>
      <p>
        Please login to create a new <abbr>ATI</abbr> project.
      </p>
    </div>
  )
}

export default AppDesc
