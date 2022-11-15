import { FC, FormEventHandler, useReducer, ChangeEvent } from "react"

import { Button, Form, FileUploader, InlineNotification, Toggle } from "carbon-components-react"
import FormData from "form-data"
import { DocumentAdd20, TrashCan20, Upload16 } from "@carbon/icons-react"
import { useRouter } from "next/router"

import { axiosClient } from "../../app"

import DatasourceModal from "./DatasourceModal"
import DeleteManuscriptModal from "./DeleteManuscriptModal"
import IngestPdf from "./IngestPdf"
import UploadManuscriptModal from "./UploadManuscriptModal"
import { uploadManuscriptReducer, UploadManuscriptActionType } from "./UploadManuscriptModal/state"
import HypothesisLoginNotification from "../../auth/HypothesisLoginNotificaton"
import useBoolean from "../../../hooks/useBoolean"
import useTask, {
  TaskActionType,
  getTaskNotificationKind,
  getTaskStatus,
} from "../../../hooks/useTask"

import { ManuscriptMimeType, ManuscriptFileExtension } from "../../../constants/arcore"
import { HYPOTHESIS_PUBLIC_GROUP_ID } from "../../../constants/hypothesis"
import { IDatasource, IManuscript } from "../../../types/dataverse"
import { deleteFile, GetApiResponse } from "../../../utils/apiUtils"
import { getMimeType } from "../../../utils/fileUtils"
import { getMessageFromError } from "../../../utils/httpRequestUtils"
import { deleteAnnotations, getAnnotations } from "../../../utils/hypothesisUtils"

import styles from "./AtiManuscript.module.css"
import formStyles from "../../../styles/Form.module.css"

export interface AtiManuscriptProps {
  /** The dataset id for the ati project */
  datasetId: string
  /** The doi of the dataset for the ati project */
  doi: string
  /** The list of datasources */
  datasources: IDatasource[]
  /** The dataverse server url where the dataset is deposited */
  serverUrl: string
  /** The manuscript for the ati project */
  manuscript: IManuscript
}

const AtiManuscript: FC<AtiManuscriptProps> = ({
  datasetId,
  doi,
  manuscript,
  datasources,
  serverUrl,
}) => {
  const router = useRouter()
  const [
    datasourcesModalIsOpen,
    { setTrue: openDatasourcesModal, setFalse: closeDatasourcesModal },
  ] = useBoolean(false)
  const [
    deleteManuscriptModalIsOpen,
    { setTrue: openDeleteManuscriptModal, setFalse: closeDeleteManuscriptModal },
  ] = useBoolean(false)
  const [uploadManuscriptTaskState, uploadManuscriptTaskDispatch] = useReducer(
    uploadManuscriptReducer,
    {
      manuscript: null,
      modalIsOpen: false,
      uploadAnnotations: false,
    }
  )
  const { state: taskState, dispatch: taskDispatch } = useTask({ status: "inactive", desc: "" })

  const onClickDeleteManuscript = () => {
    openDeleteManuscriptModal()
  }
  const handleDeleteManuscript = async () => {
    closeDeleteManuscriptModal()
    taskDispatch({ type: TaskActionType.START, payload: "Deleting manuscript..." })
    await axiosClient
      .delete(`/api/delete-file/${manuscript.id}`)
      .then(() => {
        taskDispatch({ type: TaskActionType.FINISH, payload: `Deleted ${manuscript.name}.` })
        router.reload()
      })
      .catch((error) => {
        taskDispatch({ type: TaskActionType.FAIL, payload: getMessageFromError(error) })
      })
  }

  const onChangeFileUpload = (e: ChangeEvent<HTMLInputElement>) => {
    if (e.target.files && e.target.files.length > 0) {
      uploadManuscriptTaskDispatch({
        type: UploadManuscriptActionType.SAVE_FILE_SELECTION,
        payload: e.target.files[0],
      })
    } else {
      uploadManuscriptTaskDispatch({ type: UploadManuscriptActionType.CLEAR_FILE_SELECTION })
    }
  }
  const onClearFile = () => {
    uploadManuscriptTaskDispatch({ type: UploadManuscriptActionType.CLEAR_FILE_SELECTION })
  }

  const onClickUploadManuscript: FormEventHandler<HTMLFormElement> = async (e) => {
    e.preventDefault()
    const target = e.target as typeof e.target & {
      uploadAnnotations: { checked: boolean }
    }
    if (uploadManuscriptTaskState.manuscript === null) {
      // no manuscript file found
      taskDispatch({ type: TaskActionType.FAIL, payload: "Please upload a manuscript file." })
      return
    }
    const mimeType = await getMimeType(uploadManuscriptTaskState.manuscript)
    const acceptedMimeTypes = Object.values(ManuscriptMimeType) as string[]
    if (!acceptedMimeTypes.includes(mimeType)) {
      const msg = uploadManuscriptTaskState.manuscript.type
        ? `${uploadManuscriptTaskState.manuscript.type} is not a supported file type.`
        : "Unable to determine the file type of the uploaded file."
      // manuscript file is not an acceptable mimetype
      taskDispatch({ type: TaskActionType.FAIL, payload: msg })
      return
    }
    let manuscript = uploadManuscriptTaskState.manuscript
    if (uploadManuscriptTaskState.manuscript.type === "") {
      // use the calculated mimetype
      manuscript = new File([manuscript], manuscript.name, { type: mimeType })
    }
    // opens the modal to get user confirmation to upload
    uploadManuscriptTaskDispatch({
      type: UploadManuscriptActionType.SAVE_VALID_UPLOAD_CONFIG,
      payload: {
        manuscript: manuscript,
        uploadAnnotations: target.uploadAnnotations.checked,
      },
    })
  }

  const handleUploadManuscript = async () => {
    // closes the modal if click `continue`
    uploadManuscriptTaskDispatch({ type: UploadManuscriptActionType.TOGGLE_MODAL_VISIBILITY })
    if (uploadManuscriptTaskState.manuscript) {
      const undos: GetApiResponse[] = []
      try {
        const formData = new FormData()
        formData.append("manuscript", uploadManuscriptTaskState.manuscript)
        taskDispatch({
          type: TaskActionType.START,
          payload: `Uploading ${uploadManuscriptTaskState.manuscript.name}...`,
        })
        const uploadManuscriptResponse = await axiosClient.post(
          `/api/datasets/${datasetId}/manuscript`,
          formData,
          {
            headers: {
              "Content-Type": "multipart/form-data",
            },
          }
        )
        //TODO BETTER RESPONSE
        const newManuscriptId = uploadManuscriptResponse.data.data.files[0].dataFile.id
        undos.push(deleteFile(newManuscriptId))
        if (uploadManuscriptTaskState.uploadAnnotations) {
          const deleteAnns = await getAnnotations({
            datasetId,
            hypothesisGroup: HYPOTHESIS_PUBLIC_GROUP_ID,
            isAdminDownloader: false,
          })
          if (deleteAnns.length > 0) {
            await deleteAnnotations({
              datasetId,
              annotations: deleteAnns,
              isAdminAuthor: false,
            })
          }
        }
        taskDispatch({
          type: TaskActionType.NEXT_STEP,
          payload: `${
            uploadManuscriptTaskState.uploadAnnotations
              ? "Extracting annotations"
              : "Creating ingest PDF"
          } from ${uploadManuscriptTaskState.manuscript?.name}...`,
        })
        await axiosClient.put(`/api/arcore/${newManuscriptId}`, {
          datasetId,
          uploadAnnotations: uploadManuscriptTaskState.uploadAnnotations,
        })
        taskDispatch({
          type: TaskActionType.FINISH,
          payload: `Uploaded ${uploadManuscriptTaskState.manuscript?.name}.`,
        })
        router.reload()
      } catch (e) {
        await Promise.all(undos.map((undo) => undo()))
        taskDispatch({ type: TaskActionType.FAIL, payload: getMessageFromError(e) })
      }
    } else {
      taskDispatch({ type: TaskActionType.FAIL, payload: "Please upload a manuscript file." })
    }
  }

  return (
    <>
      <DatasourceModal
        datasetId={datasetId}
        datasources={datasources}
        serverUrl={serverUrl}
        datasetDoi={doi}
        open={datasourcesModalIsOpen}
        closeModal={closeDatasourcesModal}
      />
      <DeleteManuscriptModal
        manuscriptName={manuscript.name}
        open={deleteManuscriptModalIsOpen}
        closeModal={closeDeleteManuscriptModal}
        handleDeleteManuscript={handleDeleteManuscript}
      />
      <UploadManuscriptModal
        manuscriptName={uploadManuscriptTaskState.manuscript?.name as string}
        uploadAnnotations={uploadManuscriptTaskState.uploadAnnotations}
        open={uploadManuscriptTaskState.modalIsOpen}
        closeModal={() =>
          uploadManuscriptTaskDispatch({ type: UploadManuscriptActionType.TOGGLE_MODAL_VISIBILITY })
        }
        handleUploadManuscript={handleUploadManuscript}
      />
      <div className={styles.tabContainer}>
        <HypothesisLoginNotification />
        <div className={styles.buttonContainer}>
          <Button
            kind="tertiary"
            size="md"
            onClick={openDatasourcesModal}
            renderIcon={DocumentAdd20}
          >
            Add data sources
          </Button>
          {manuscript.id && (
            <Button
              kind="danger"
              size="md"
              renderIcon={TrashCan20}
              onClick={onClickDeleteManuscript}
            >
              Delete manuscript
            </Button>
          )}
        </div>
        {taskState.status !== "inactive" && (
          <InlineNotification
            hideCloseButton
            lowContrast
            kind={getTaskNotificationKind(taskState)}
            subtitle={<span>{taskState.desc}</span>}
            title={getTaskStatus(taskState)}
          />
        )}
        {manuscript.id ? (
          manuscript.ingest ? (
            <IngestPdf pdf={manuscript.ingest} />
          ) : (
            <InlineNotification
              hideCloseButton
              lowContrast
              kind="info"
              subtitle={<span>Ingest PDF of manuscript not found.</span>}
              title="Error!"
            />
          )
        ) : (
          <div className={styles.centerUploadManuscript}>
            <Form onSubmit={onClickUploadManuscript}>
              <div className={formStyles.item}>
                <FileUploader
                  aria-required={true}
                  accept={[
                    ManuscriptFileExtension.docx,
                    ManuscriptFileExtension.pdf,
                    ManuscriptMimeType.docx,
                    ManuscriptMimeType.pdf,
                  ]}
                  buttonKind="tertiary"
                  buttonLabel="Add file"
                  filenameStatus="edit"
                  iconDescription="Clear file"
                  labelDescription="Supported file types are .docx and .pdf"
                  labelTitle="Upload manuscript"
                  name="manuscript"
                  size="small"
                  onChange={onChangeFileUpload}
                  onDelete={onClearFile}
                />
              </div>
              <div className={formStyles.item}>
                <Toggle
                  id="upload-annotations-toggle"
                  labelA="No"
                  labelB="Yes"
                  labelText="Start with new annotations?"
                  name="uploadAnnotations"
                />
              </div>
              <Button type="submit" kind="tertiary" size="sm" renderIcon={Upload16}>
                Upload manuscript
              </Button>
            </Form>
          </div>
        )}
      </div>
    </>
  )
}

export default AtiManuscript
