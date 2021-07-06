import { FC } from "react"

import { UnorderedList, ListItem, Button, Link } from "carbon-components-react"

import { IATIProjectDetails } from "../../../types/dataverse"

import styles from "./ATISummary.module.css"
import layoutStyles from "../../components/Layout/Layout.module.css"

interface ATISummaryProps {
  serverUrl: string
  atiProjectDetails: IATIProjectDetails
}

//api/access/dataset/id dl bundle
//update annotations first then use api
//https://github.com/QualitativeDataRepository/dataverse/blob/develop/src/main/java/edu/harvard/iq/dataverse/api/Datasets.java#L1088
//layout the doi link

const ATISummary: FC<ATISummaryProps> = ({ serverUrl, atiProjectDetails }) => {
  const { doi, title, status, version } = atiProjectDetails.dataset
  const { manuscript, datasources } = atiProjectDetails
  return (
    <div className={layoutStyles.maxwidth}>
      <div className={styles.buttoncontainer}>
        <Button kind="tertiary" size="field">
          Download project bundle
        </Button>
        <Button kind="tertiary" size="field">
          Publish project
        </Button>
      </div>
      <section aria-label="about" className={styles.section}>
        <h2 className={styles.header}>About</h2>
        <p>
          Project Title:{" "}
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
