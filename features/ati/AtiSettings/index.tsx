import { FC, FormEventHandler } from "react"

import { Button, Form } from "carbon-components-react"

import { IDataset } from "../../../types/dataverse"

import styles from "./AtiSettings.module.css"
import layoutStyles from "../../components/Layout/Layout.module.css"

interface AtiSettingsProps {
  dataset: IDataset
}

const AtiSettings: FC<AtiSettingsProps> = ({ dataset }) => {
  const onSubmit: FormEventHandler<HTMLFormElement> = (e) => {
    e.preventDefault()
    dataset.id //remove the tag
    //api call remove ar tag, delete files
  }
  return (
    <div className={layoutStyles.maxwidth}>
      <h2>Danger zone</h2>
      <div className={styles.dangerzone}>
        <Form onSubmit={onSubmit}>
          <div className={styles.title}>
            Delete <abbr>ATI</abbr> project
          </div>
          <p className={styles.desc}>
            Unmark the Dataverse dataset as an <abbr>ATI</abbr> project and remove the manuscript
            and annotation files.
          </p>
          <Button type="submit" kind="danger" size="sm">
            Delete
          </Button>
        </Form>
      </div>
    </div>
  )
}

export default AtiSettings
