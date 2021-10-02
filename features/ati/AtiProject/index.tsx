import React, { FC } from "react"

import NextLink from "next/link"

import { Link, Tag } from "carbon-components-react"

import { AtiTab } from "../../../constants/ati"
import { PUBLICATION_STATUSES_COLOR } from "../../../constants/dataverse"

import styles from "./AtiProject.module.css"

export interface AtiProjectProps {
  /**The id of the dataset for the ati project */
  id: string
  /**The name of the dataset for the ati project */
  name: string
  /**The description of the dataset for the ati project */
  description: string
  /**The dataverse where the dataset for the ati project is deposited */
  dataverseName: string
  /**The citation string of the dataset for the ati project */
  citationHtml: string
  /**The publication statuses of the dataset for the ati project */
  publicationStatuses: string[]
  /**When the dataset for the ati project was created */
  dateDisplay: string
  /**The user roles of the dataset for the ati project */
  userRoles: string[]
  /**The dataverse server url where the dataset for the ati project is deposited */
  dataverseServerUrl: string
  /**The dataverse id where the dataset for the ati project is deposited */
  dataverse: string
}

/**A summary view of an ati project */
const AtiProject: FC<AtiProjectProps> = ({
  id,
  name,
  description,
  dataverseName,
  citationHtml,
  publicationStatuses,
  dateDisplay,
  userRoles,
  dataverseServerUrl,
  dataverse,
}) => {
  return (
    <section aria-label={name} className={styles.atiProject}>
      <div className={styles.titleContainer}>
        <h2>
          <NextLink href={`/ati/${id}/${AtiTab.summary.id}`}>
            <a className="bx--link" href={`/ati/${id}/${AtiTab.summary.id}`}>
              {name}
            </a>
          </NextLink>
        </h2>
        <div className={styles.tags}>
          {publicationStatuses.sort().map((status, i) => (
            <Tag
              key={i}
              id={`${status} status`}
              type={PUBLICATION_STATUSES_COLOR[status]}
              size="sm"
            >
              {status}
            </Tag>
          ))}
          {userRoles.sort().map((role, i) => (
            <Tag key={i} id={`${role} role`} type="teal" size="sm">
              {role}
            </Tag>
          ))}
        </div>
      </div>
      <p>
        {dateDisplay} -{" "}
        <Link
          target="_blank"
          rel="noopener noreferrer"
          href={`${dataverseServerUrl}/dataverse/${dataverse}`}
        >
          {dataverseName}
        </Link>
      </p>
      <p className={styles.citation}>
        <span dangerouslySetInnerHTML={{ __html: citationHtml }} />{" "}
      </p>
      <p>{description}</p>
    </section>
  )
}

export default AtiProject
