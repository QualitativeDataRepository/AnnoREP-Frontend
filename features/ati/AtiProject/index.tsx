import React, { FC } from "react"

import NextLink from "next/link"

import { Link } from "carbon-components-react"

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
  //publicationStatuses,
  dateDisplay,
  //userRoles,
  dataverseServerUrl,
  dataverse,
}) => {
  return (
    <section aria-label={name} className={styles.atiProject}>
      <h2>
        <NextLink href={`/ati/${id}`}>
          <a className="bx--link" href={`/ati/${id}`}>
            {name}
          </a>
        </NextLink>
      </h2>
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
