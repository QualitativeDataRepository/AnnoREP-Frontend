import { FC, FormEventHandler, useReducer, useState } from "react"

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
import useBoolean from "../../../hooks/useBoolean"

import { ManuscriptMimeType, ManuscriptFileExtension } from "../../../constants/arcore"
import { IDatasource, IManuscript } from "../../../types/dataverse"
import { getMimeType } from "../../../utils/fileUtils"
import { getMessageFromError } from "../../../utils/httpRequestUtils"

import styles from "./AtiManuscript.module.css"

interface AtiManuscriptProps {
  datasetId: string
  doi: string
  datasources: IDatasource[]
  serverUrl: string
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
    manuscript: undefined,
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

  const onClickUploadManuscript: FormEventHandler<HTMLFormElement> = async (e) => {
    e.preventDefault()
    const target = e.target as typeof e.target & {
      manuscript: { files: FileList }
      uploadAnnotations: { checked: boolean }
    }
    if (target.manuscript.files.length === 0) {
      setTaskStatus("error")
      setTaskDesc("Please upload a manuscript file.")
      return
    }
    const firstFourBytes = await target.manuscript.files[0].slice(0, 4).arrayBuffer()
    const firstFourBytesView = new Int8Array(firstFourBytes)
    const mimeType = target.manuscript.files[0].type
      ? target.manuscript.files[0].type
      : getMimeType(firstFourBytesView)
    const acceptedMimeTypes = Object.values(ManuscriptMimeType) as string[]
    if (!acceptedMimeTypes.includes(mimeType)) {
      const msg = target.manuscript.files[0].type
        ? `${target.manuscript.files[0].type} is not a supported file type.`
        : "Unable to determine the file type of the uploaded file."
      setTaskStatus("error")
      setTaskDesc(msg)
      return
    }
    let manuscript = target.manuscript.files[0]
    if (target.manuscript.files[0].type === "") {
      manuscript = new File([manuscript], manuscript.name, { type: mimeType })
    }
    dispatch({
      type: "UPLOAD",
      payload: {
        manuscript: manuscript,
        uploadAnnotations: target.uploadAnnotations.checked,
      },
    })
  }

  const handleUploadManuscript = async () => {
    if (uploadManuscript.manuscript) {
      dispatch({ type: "TOGGLE_MODAL_IS_OPEN" })
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
              }).then(({ data }) => {
                if (data.total > 0) {
                  setTaskDesc(
                    `Deleting ${data.total} current annotation(s) from Hypothes.is server...`
                  )
                  return axios({
                    method: "DELETE",
                    url: `/api/hypothesis/${datasetId}/delete-annotations`,
                    data: JSON.stringify({ annotations: data.annotations }),
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
                type="submit"
                kind="danger"
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
            kind={
              taskStatus === "active" ? "info" : taskStatus === "finished" ? "success" : "error"
            }
            subtitle={<span>{taskDesc}</span>}
            title={
              taskStatus === "active" ? "Status" : taskStatus === "finished" ? "Success!" : "Error!"
            }
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
              <div className="ar--form-item">
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
                />
              </div>
              <div className="ar--form-item">
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
