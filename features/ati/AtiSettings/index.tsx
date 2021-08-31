import { FC, FormEventHandler, useState } from "react"

import axios from "axios"
import { TrashCan16 } from "@carbon/icons-react"
import { Button, Form, InlineNotification, InlineLoadingStatus } from "carbon-components-react"
import { useRouter } from "next/router"

import { IDataset, IManuscript } from "../../../types/dataverse"
import { getMessageFromError } from "../../../utils/httpRequestUtils"

import styles from "./AtiSettings.module.css"
import layoutStyles from "../../components/Layout/Layout.module.css"

interface AtiSettingsProps {
  dataset: IDataset
  manuscript: IManuscript
}

const AtiSettings: FC<AtiSettingsProps> = ({ dataset, manuscript }) => {
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
        if (manuscript.id) {
          setTaskDesc(`Deleting manuscript ${manuscript.name}...`)
          return axios.delete(`/api/delete-file/${manuscript.id}`)
        } else {
          return Promise.resolve<any>("Skip!")
        }
      })
      .then(() => {
        return axios.get(`/api/hypothesis/${dataset.id}/download-annotations`)
      })
      .then(({ data }) => {
        if (data.total > 0) {
          setTaskDesc("Deleting annotations from Hypothes.is server...")
          return axios.delete(`/api/hypothesis/${dataset.id}/delete-annotations`, {
            data: JSON.stringify({ annotations: data.annotations }),
            headers: {
              "Content-Type": "application/json",
            },
          })
        }
      })
      .then(() => {
        setTaskStatus("finished")
        setTaskDesc(`Deleted ATI project from dataset ${dataset.title}.`)
        router.push("/")
      })
      .catch((error) => {
        setTaskStatus("error")
        setTaskDesc(`${getMessageFromError(error)}`)
      })
  }
  return (
    <div className={layoutStyles.maxWidth}>
      <h2>Danger zone</h2>
      <div className={styles.dangerZone}>
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
          <Button type="submit" kind="danger" size="sm" renderIcon={TrashCan16}>
            Delete
          </Button>
        </Form>
      </div>
    </div>
  )
}

export default AtiSettings
