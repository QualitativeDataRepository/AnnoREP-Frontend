import React, { FC } from "react"

import NextLink from "next/link"

import { Link, Tag } from "carbon-components-react"

import { AtiTab } from "../../../constants/ati"
import { PUBLICATION_STATUSES_COLOR } from "../../../constants/dataverse"

import styles from "./AtiProject.module.css"

export interface AtiProjectProps {
  id: string
  name: string
  description: string
  dataverseName: string
  citationHtml: string
  publicationStatuses: string[]
  dateDisplay: string
  userRoles: string[]
  dataverseServerUrl: string
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
            <Tag key={i} id={status} type={PUBLICATION_STATUSES_COLOR[status]} size="sm">
              {status}
            </Tag>
          ))}
          {userRoles.sort().map((role, i) => (
            <Tag key={i} id={role} type="teal" size="sm">
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
