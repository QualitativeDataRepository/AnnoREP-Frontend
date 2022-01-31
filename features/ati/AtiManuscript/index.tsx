import { FC, FormEventHandler, useReducer, useState, ChangeEvent } from "react"

import axios from "axios"
import {
  Button,
  Form,
  FileUploader,
  InlineNotification,
  InlineLoadingStatus,
  Toggle,
} from "carbon-components-react"
import FormData from "form-data"
import { Document20, TrashCan20, Upload16 } from "@carbon/icons-react"
import { useRouter } from "next/router"

import DatasourceModal from "./DatasourceModal"
import DeleteManuscriptModal from "./DeleteManuscriptModal"
import IngestPdf from "./IngestPdf"
import UploadManuscriptModal from "./UploadManuscriptModal"
import { uploadManuscriptReducer } from "./UploadManuscriptModal/state"
import HypothesisLoginNotification from "../../auth/HypothesisLoginNotificaton"
import useBoolean from "../../../hooks/useBoolean"

import { ManuscriptMimeType, ManuscriptFileExtension } from "../../../constants/arcore"
import { IDatasource, IManuscript } from "../../../types/dataverse"
import { getMimeType } from "../../../utils/fileUtils"
import { getMessageFromError } from "../../../utils/httpRequestUtils"
import { getTaskNotificationKind, getTaskStatus } from "../../../utils/taskStatusUtils"

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
  const [uploadManuscript, dispatch] = useReducer(uploadManuscriptReducer, {
    manuscript: null,
    modalIsOpen: false,
    uploadAnnotations: false,
  })
  const [taskStatus, setTaskStatus] = useState<InlineLoadingStatus>("inactive")
  const [taskDesc, setTaskDesc] = useState<string>("")

  const onClickDeleteManuscript: FormEventHandler<HTMLFormElement> = async (e) => {
    e.preventDefault()
    openDeleteManuscriptModal()
  }
  const handleDeleteManuscript = async () => {
    closeDeleteManuscriptModal()
    setTaskStatus("active")
    setTaskDesc("Deleting manuscript...")
    await axios
      .delete(`/api/delete-file/${manuscript.id}`)
      .then(() => {
        setTaskStatus("finished")
        setTaskDesc(`Deleted ${manuscript.name}.`)
        router.reload()
      })
      .catch((error) => {
        setTaskStatus("error")
        setTaskDesc(`${getMessageFromError(error)}`)
      })
  }

  const onChangeFileUpload = (e: ChangeEvent<HTMLInputElement>) => {
    dispatch({ type: "SET_MANUSCRIPT", payload: e.target.files ? e.target.files[0] : null })
  }
  const onClearFile = () => {
    dispatch({ type: "SET_MANUSCRIPT", payload: null })
  }

  const onClickUploadManuscript: FormEventHandler<HTMLFormElement> = async (e) => {
    e.preventDefault()
    const target = e.target as typeof e.target & {
      uploadAnnotations: { checked: boolean }
    }
    if (uploadManuscript.manuscript === null) {
      setTaskStatus("error")
      setTaskDesc("Please upload a manuscript file.")
      return
    }
    const mimeType = await getMimeType(uploadManuscript.manuscript)
    const acceptedMimeTypes = Object.values(ManuscriptMimeType) as string[]
    if (!acceptedMimeTypes.includes(mimeType)) {
      const msg = uploadManuscript.manuscript.type
        ? `${uploadManuscript.manuscript.type} is not a supported file type.`
        : "Unable to determine the file type of the uploaded file."
      setTaskStatus("error")
      setTaskDesc(msg)
      return
    }
    let manuscript = uploadManuscript.manuscript
    if (uploadManuscript.manuscript.type === "") {
      manuscript = new File([manuscript], manuscript.name, { type: mimeType })
    }
    dispatch({
      type: "UPLOAD_MANUSCRIPT",
      payload: {
        manuscript: manuscript,
        uploadAnnotations: target.uploadAnnotations.checked,
      },
    })
  }

  const handleUploadManuscript = async () => {
    dispatch({ type: "TOGGLE_MODAL_IS_OPEN" })
    if (uploadManuscript.manuscript) {
      const formData = new FormData()
      formData.append("manuscript", uploadManuscript.manuscript)
      setTaskStatus("active")
      setTaskDesc(`Uploading ${uploadManuscript.manuscript.name}...`)
      await axios({
        method: "POST",
        url: `/api/datasets/${datasetId}/manuscript`,
        data: formData,
        headers: {
          "Content-Type": "multipart/form-data",
        },
      })
        .then(async ({ data }) => {
          const newManuscriptId = data.data.files[0].dataFile.id
          const deleteAnnotationsPromise = uploadManuscript.uploadAnnotations
            ? axios({
                method: "GET",
                url: `/api/hypothesis/${datasetId}/download-annotations`,
                params: {
                  hypothesisGroup: "",
                  isAdminAuthor: false,
                },
              }).then(({ data }) => {
                if (data.total > 0) {
                  setTaskDesc(`Deleting current annotation(s) from Hypothes.is server...`)
                  return axios({
                    method: "DELETE",
                    url: `/api/hypothesis/${datasetId}/delete-annotations`,
                    data: JSON.stringify({ annotations: data.annotations }),
                    params: {
                      isAdminAuthor: false,
                    },
                    headers: {
                      "Content-Type": "application/json",
                    },
                  })
                }
              })
            : Promise.resolve("Skip!")
          return await deleteAnnotationsPromise.then(() => {
            setTaskDesc(
              `${
                uploadManuscript.uploadAnnotations
                  ? "Extracting annotations"
                  : "Creating ingest PDF"
              } from ${uploadManuscript.manuscript?.name}...`
            )
            return axios({
              method: "PUT",
              url: `/api/arcore/${newManuscriptId}`,
              params: {
                datasetId: datasetId,
                uploadAnnotations: uploadManuscript.uploadAnnotations,
              },
            })
          })
        })
        .then(() => {
          setTaskStatus("finished")
          setTaskDesc(`Uploaded ${uploadManuscript.manuscript?.name}.`)
          router.reload()
        })
        .catch((error) => {
          setTaskStatus("error")
          setTaskDesc(`${getMessageFromError(error)}`)
        })
    } else {
      setTaskStatus("error")
      setTaskDesc("Please upload a manuscript file.")
    }
  }

  return (
    <>
      <DatasourceModal
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
        manuscriptName={uploadManuscript.manuscript?.name as string}
        uploadAnnotations={uploadManuscript.uploadAnnotations}
        open={uploadManuscript.modalIsOpen}
        closeModal={() => dispatch({ type: "TOGGLE_MODAL_IS_OPEN" })}
        handleUploadManuscript={handleUploadManuscript}
      />
      <div className={styles.tabContainer}>
        <HypothesisLoginNotification />
        <div className={styles.buttonContainer}>
          <Button
            className={styles.blackButton}
            kind="ghost"
            size="md"
            hasIconOnly
            iconDescription="Show datasources"
            tooltipPosition="top"
            tooltipAlignment="start"
            onClick={openDatasourcesModal}
          >
            <Document20 />
          </Button>
          {manuscript.id && (
            <Form onSubmit={onClickDeleteManuscript} className={styles.deleteManuscript}>
              <Button
                className="bx--btn--danger"
                type="submit"
                size="md"
                hasIconOnly
                iconDescription="Delete manuscript and upload another file"
                tooltipPosition="top"
                tooltipAlignment="end"
              >
                <TrashCan20 />
              </Button>
            </Form>
          )}
        </div>
        {taskStatus !== "inactive" && (
          <InlineNotification
            hideCloseButton
            lowContrast
            kind={getTaskNotificationKind(taskStatus)}
            subtitle={<span>{taskDesc}</span>}
            title={getTaskStatus(taskStatus)}
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
