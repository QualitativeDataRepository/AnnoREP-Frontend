import { FC, FormEventHandler, useState } from "react"

import axios from "axios"
import { Button, Form, InlineNotification, InlineLoadingStatus } from "carbon-components-react"
import { useRouter } from "next/router"

import { IDataset } from "../../../types/dataverse"
import { getMessageFromError } from "../../../utils/httpRequestUtils"

import styles from "./AtiSettings.module.css"
import layoutStyles from "../../components/Layout/Layout.module.css"

interface AtiSettingsProps {
  dataset: IDataset
  manuscriptId: string
}

const AtiSettings: FC<AtiSettingsProps> = ({ dataset, manuscriptId }) => {
  const router = useRouter()
  const [taskStatus, setTaskStatus] = useState<InlineLoadingStatus>("inactive")
  const [taskDesc, setTaskDesc] = useState<string>("")
  const onSubmit: FormEventHandler<HTMLFormElement> = async (e) => {
    e.preventDefault()
    setTaskStatus("active")
    setTaskDesc(`Deleting ATI project...`)
    await axios
      .put(`/api/datasets/${dataset.id}/annorep/delete`)
      .then(() => {
        if (manuscriptId) {
          setTaskDesc("Deleting manuscript...")
          return axios.delete(`/api/delete-file/${manuscriptId}`)
        } else {
          return Promise.resolve<any>("Skip!")
        }
      })
      .then(() => {
        setTaskStatus("finished")
        setTaskDesc("Deleted ATI project.")
        router.push("/")
      })
      .catch((error) => {
        setTaskStatus("error")
        setTaskDesc(`${getMessageFromError(error)}`)
      })
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
            file.
          </p>
          {taskStatus !== "inactive" && (
            <div className="ar--form-item">
              <InlineNotification
                hideCloseButton
                lowContrast
                kind={
                  taskStatus === "active" ? "info" : taskStatus === "finished" ? "success" : "error"
                }
                subtitle={<span>{taskDesc}</span>}
                title={
                  taskStatus === "active"
                    ? "Status"
                    : taskStatus === "finished"
                    ? "Success!"
                    : "Error!"
                }
              />
            </div>
          )}
          <Button type="submit" kind="danger" size="sm">
            Delete
          </Button>
        </Form>
      </div>
    </div>
  )
}

export default AtiSettings
