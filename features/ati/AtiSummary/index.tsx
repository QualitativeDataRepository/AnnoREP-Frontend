import { FC } from "react"

import { UnorderedList, ListItem, Link } from "carbon-components-react"
import { Download16 } from "@carbon/icons-react"

import { IATIProjectDetails } from "../../../types/dataverse"

import styles from "./ATISummary.module.css"
import layoutStyles from "../../components/Layout/Layout.module.css"

interface ATISummaryProps {
  serverUrl: string
  atiProjectDetails: IATIProjectDetails
}

const ATISummary: FC<ATISummaryProps> = ({ serverUrl, atiProjectDetails }) => {
  const { doi, title, status, version, zip } = atiProjectDetails.dataset
  const { manuscript, datasources } = atiProjectDetails

  return (
    <div className={layoutStyles.maxwidth}>
      <section aria-label="about" className={styles.section}>
        <h2 className={styles.header}>About</h2>
        <p>
          Project title:{" "}
          <Link
            href={`${serverUrl}/dataset.xhtml?persistentId=${doi}`}
            target="_blank"
            rel="noopener noreferrer"
            size="lg"
          >
            {title}
          </Link>
        </p>
        <span className="ar--secondary-text">{`Version ${version} • ${status}`}</span>
        {zip && (
          <div className={styles.download}>
            <Link
              href={`data:application/zip;base64,${zip}`}
              download={`dataverse_files.zip`}
              size="lg"
              renderIcon={Download16}
            >
              Download project
            </Link>
          </div>
        )}
      </section>
      <section aria-label="manuscript" className={styles.section}>
        <h2 className={styles.header}>Manuscript</h2>
        <p>{manuscript.name}</p>
      </section>
      <section aria-label="datasources" className={styles.section}>
        <h2 className={styles.header}>Datasources</h2>
        <div className={styles.listcontainer}>
          <UnorderedList>
            {datasources.map(({ id, name }) => (
              <ListItem key={id}>{name}</ListItem>
            ))}
          </UnorderedList>
        </div>
      </section>
    </div>
  )
}

export default ATISummary
