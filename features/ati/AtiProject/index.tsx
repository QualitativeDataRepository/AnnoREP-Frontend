import React, { FC } from "react"

import Link from "next/link"

import styles from "./AtiProject.module.css"

export interface AtiProjectProps {
  /**The id of the ati project */
  id: string
  /**The title of the ati project */
  title: string
  /**The description of the ati project */
  description: string
  /**The version of the ati project */
  version: string
  /**The status of the ati project */
  status: string
}

/**A summary view of an ati project */
const AtiProject: FC<AtiProjectProps> = ({ id, title, description, version, status }) => {
  return (
    <section aria-label={title} className={styles.atiProject}>
      <h2>
        <Link href={`/ati/${id}`}>
          <a className="bx--link" href={`/ati/${id}`}>
            {title}
          </a>
        </Link>
      </h2>
      <p>{description}</p>
      <p>{`Version ${version} • ${status}`}</p>
    </section>
  )
}

export default AtiProject
