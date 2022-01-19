import { FC } from "react"

import AppDesc from "../AppDesc"

import styles from "./AppGuide.module.css"

export interface AppGuideProps {
  isLoggedIn: boolean
}

const AppGuide: FC<AppGuideProps> = ({ isLoggedIn }) => {
  return (
    <div className={styles.container}>
      <AppDesc isLoggedIn={isLoggedIn} />
      <br />
      <br />
      <h1 id="get-started" className={styles.heading}>
        Get started
      </h1>
      <div className={styles.guide}>
        <div>
          <h2>
            1. Create accounts for Hypothes.is and <abbr>QDR</abbr>
          </h2>
          <div className={styles.logos}>
            <img src="/assets/hypothesis.png" alt="" />
            <img src="/assets/qdr-sketch.png" alt="" />
          </div>
        </div>
        <div>
          <h2>
            2. Annotate your manuscript with Word comments or <abbr>PDF</abbr> annotations
          </h2>
          <img src="/assets/manuscript.png" alt="" />
        </div>
        <div>
          <h2>
            3. Login to AnnoREP with your <abbr>QDR</abbr> and Hypothes.is information
          </h2>
          <img src="/assets/login.png" alt="" />
        </div>
        <div>
          <h2>
            4. Upload your annotated manuscript to convert it to <abbr>ATI</abbr> &amp; connect it
            to a <abbr>QDR</abbr> data project
          </h2>
          <img src="/assets/upload.png" alt="" />
        </div>
        <div>
          <h2>
            5. Add, edit, or remove <abbr>ATI</abbr> annotations
          </h2>
          <img src="/assets/edit-annotations.png" alt="" />
        </div>
        <div>
          <h2>
            6 a. Submit your project for review &amp; publication by <abbr>QDR</abbr>
          </h2>
          <img src="/assets/submit.png" alt="" />
        </div>
        <div>
          <h2>
            6 b. Copy your <abbr>ATI</abbr> annotations to a copy of your manuscript anywhere on the
            web
          </h2>
          <img src="/assets/copy-annotations.png" alt="" />
        </div>
      </div>
    </div>
  )
}

export default AppGuide
