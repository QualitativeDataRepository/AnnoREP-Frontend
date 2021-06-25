import { ChangeEvent, FC, useState } from "react"

import { Form, TextInput, Button } from "carbon-components-react"

import { IDataset } from "../../../types/dataverse"

import styles from "./AtiSettings.module.css"
import layoutStyles from "../../components/Layout/Layout.module.css"

interface AtiSettingsProps {
  dataset: IDataset
}

const AtiSettings: FC<AtiSettingsProps> = ({ dataset }) => {
  const [title, setTitle] = useState(dataset.title)
  const onTitleChange = (event: ChangeEvent<HTMLInputElement>) => setTitle(event.target.value)
  return (
    <div className={layoutStyles.maxwidth}>
      <h2>Settings</h2>
      <Form>
        <div className={styles.input}>
          <TextInput
            id="project-title"
            name="projecttitle"
            labelText="Project title"
            placeholder="Project title"
            value={title}
            onChange={onTitleChange}
          />
          <div>
            <Button type="submit" kind="tertiary" size="field">
              Rename
            </Button>
          </div>
        </div>
      </Form>
      <h2 className={styles.dangertitle}>Danger zone</h2>
      <div className={styles.dangerzone}>
        <div className={styles.dangeritem}>
          <div>
            <div className={styles.bold}>Delete this project</div>
            <div>Once you delete a project, there is no going back. Please be certain.</div>
          </div>
          <div>
            <Button kind="danger" size="field">
              Delete this project
            </Button>
          </div>
        </div>
      </div>
    </div>
  )
}

export default AtiSettings
