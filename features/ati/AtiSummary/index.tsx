import { FC } from "react"

import { UnorderedList, ListItem, Button } from "carbon-components-react"

import { IATIProjectDetails } from "../../../types/dataverse"

import styles from "./ATISummary.module.css"
import layoutStyles from "../../components/Layout/Layout.module.css"

interface ATISummaryProps {
  atiProjectDetails: IATIProjectDetails
}

const ATISummary: FC<ATISummaryProps> = ({ atiProjectDetails }) => {
  const { title, status, version } = atiProjectDetails.dataset
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
        <p>Project Title: {title}</p>
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
