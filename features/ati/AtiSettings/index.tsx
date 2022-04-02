import { FC, FormEventHandler } from "react"

import { TrashCan16 } from "@carbon/icons-react"
import { Button, Form, InlineNotification } from "carbon-components-react"
import { useRouter } from "next/router"

import { axiosClient } from "../../app"

import DeleteAtiModal from "./DeleteAtiModal"

import useBoolean from "../../../hooks/useBoolean"
import useTask, {
  TaskActionType,
  getTaskNotificationKind,
  getTaskStatus,
} from "../../../hooks/useTask"
import { IDataset, IManuscript } from "../../../types/dataverse"
import { getMessageFromError } from "../../../utils/httpRequestUtils"
import { deleteAnnotations, getAnnotations } from "../../../utils/hypothesisUtils"

import styles from "./AtiSettings.module.css"
import formStyles from "../../../styles/Form.module.css"
import layoutStyles from "../../components/Layout/Layout.module.css"

export interface AtiSettingsProps {
  /** The dataset for the ati project */
  dataset: IDataset
  /** The manuscript for the ati project */
  manuscript: IManuscript
}

const AtiSettings: FC<AtiSettingsProps> = ({ dataset, manuscript }) => {
  const router = useRouter()
  const [deleteAtiModalIsOpen, { setTrue: openDeleteAtiModal, setFalse: closeDeleteAtiModal }] =
    useBoolean(false)
  const { state: taskState, dispatch: taskDispatch } = useTask({ status: "inactive", desc: "" })

  const onSubmit: FormEventHandler<HTMLFormElement> = async (e) => {
    e.preventDefault()
    openDeleteAtiModal()
  }

  const handleDeleteAti = async () => {
    closeDeleteAtiModal()
    try {
      taskDispatch({ type: TaskActionType.START, payload: "Deleting ATI project..." })
      const deleteAnns = await getAnnotations({
        datasetId: dataset.id,
        hypothesisGroup: "",
        isAdminDownloader: false,
      })
      if (deleteAnns.length > 0) {
        taskDispatch({
          type: TaskActionType.NEXT_STEP,
          payload: "Deleting annotations from Hypothes.is server...",
        })
        await deleteAnnotations({
          taskDispatch,
          datasetId: dataset.id,
          annotations: deleteAnns,
          isAdminAuthor: false,
        })
      }
      if (manuscript.id) {
        taskDispatch({
          type: TaskActionType.NEXT_STEP,
          payload: `Deleting manuscript ${manuscript.name}...`,
        })
        await axiosClient.delete(`/api/delete-file/${manuscript.id}`)
      }
      await axiosClient.put(`/api/datasets/${dataset.id}/annorep/delete`)
      taskDispatch({
        type: TaskActionType.FINISH,
        payload: `Deleted ATI project from data project ${dataset.title}.`,
      })
      router.push("/")
    } catch (e) {
      taskDispatch({ type: TaskActionType.FAIL, payload: getMessageFromError(e) })
    }
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
            Unmark the <abbr>QDR</abbr> data project as an <abbr>ATI</abbr> project and remove the
            manuscript file.
          </p>
          {taskState.status !== "inactive" && (
            <div className={formStyles.item}>
              <InlineNotification
                hideCloseButton
                lowContrast
                kind={getTaskNotificationKind(taskState)}
                subtitle={<span>{taskState.desc}</span>}
                title={getTaskStatus(taskState)}
              />
            </div>
          )}
          <Button type="submit" kind="danger" size="sm" renderIcon={TrashCan16}>
            Delete
          </Button>
        </Form>
        <DeleteAtiModal
          atiName={dataset.title}
          open={deleteAtiModalIsOpen}
          closeModal={closeDeleteAtiModal}
          handleDeleteAti={handleDeleteAti}
        />
      </div>
    </div>
  )
}

export default AtiSettings
