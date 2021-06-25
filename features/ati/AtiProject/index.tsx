import React, { FC } from "react"

import Link from "next/link"

import styles from "./AtiProject.module.css"

export interface AtiProjectProps {
  /**The id of the ati project */
  id: string
  /**The title of the ati project */
  title: string
  /**The version of the ati project */
  version: string
  /**The status of the ati project */
  status: string
}

/**A summary view of an ati project */
const AtiProject: FC<AtiProjectProps> = ({ id, title, version, status }) => {
  return (
    <section aria-label={title} className={styles.atiproject}>
      <h2>
        <Link href={`/ati/${id}`}>
          <a className="bx--link bx--link--lg" href={`/ati/${id}`}>
            {title}
          </a>
        </Link>
      </h2>
      <span className="ar--secondary-text">{`Version ${version} • ${status}`}</span>
    </section>
  )
}

export default AtiProject
