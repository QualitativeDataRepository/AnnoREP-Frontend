import { FC, FormEventHandler, useState } from "react"

import axios from "axios"
import {
  Button,
  Form,
  FileUploader,
  Link,
  InlineNotification,
  Modal,
  CopyButton,
  InlineLoadingStatus,
} from "carbon-components-react"
import FormData from "form-data"
import { CopyToClipboard } from "react-copy-to-clipboard"
import { Popup16, TrashCan16, Upload16, Launch16 } from "@carbon/icons-react"
import { useRouter } from "next/router"

import { ManuscriptMimeType, ManuscriptFileExtension } from "../../../constants/arcore"
import { IDatasource } from "../../../types/dataverse"
import { getMimeType } from "../../../utils/fileUtils"
import { getMessageFromError } from "../../../utils/httpRequestUtils"

import styles from "./AtiManuscript.module.css"

interface AtiManuscriptProps {
  datasetId: string
  doi: string
  datasources: IDatasource[]
  serverUrl: string
  manuscriptId?: string
}

const AtiManuscript: FC<AtiManuscriptProps> = ({
  datasetId,
  doi,
  manuscriptId,
  datasources,
  serverUrl,
}) => {
  const router = useRouter()
  const [modalIsOpen, setModalIsopen] = useState<boolean>(false)
  const openModal = () => setModalIsopen(true)
  const closeModal = () => setModalIsopen(false)
  const [taskStatus, setTaskStatus] = useState<InlineLoadingStatus>("inactive")
  const [taskDesc, setTaskDesc] = useState<string>("")

  const onDelete: FormEventHandler<HTMLFormElement> = async (e) => {
    e.preventDefault()
    const id = manuscriptId as string
    setTaskStatus("active")
    setTaskDesc("Deleting manuscript...")
    await axios
      .delete(`/api/delete-file/${id}`)
      .then(() => {
        setTaskStatus("finished")
        setTaskDesc(`Deleted manuscript ${manuscriptId}.`)
        router.reload()
      })
      .catch((error) => {
        setTaskStatus("error")
        setTaskDesc(`${getMessageFromError(error)}`)
      })
  }

  const onUpload: FormEventHandler<HTMLFormElement> = async (e) => {
    e.preventDefault()
    const target = e.target as typeof e.target & {
      manuscript: { files: FileList }
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
    const formData = new FormData()
    formData.append("manuscript", manuscript)
    setTaskStatus("active")
    setTaskDesc(`Uploading ${manuscript.name}...`)
    await axios({
      method: "POST",
      url: `/api/datasets/${datasetId}/manuscript`,
      data: formData,
      headers: {
        "Content-Type": "multipart/form-data",
      },
    })
      .then(({ data }) => {
        setTaskDesc("Extracting annotations...")
        const newManuscriptId = data.data.files[0].dataFile.id
        return axios({
          method: "PUT",
          url: `/api/arcore/${newManuscriptId}`,
        })
      })
      .then(() => {
        setTaskStatus("finished")
        setTaskDesc(`Uploaded ${manuscript.name}.`)
        router.reload()
      })
      .catch((error) => {
        setTaskStatus("error")
        setTaskDesc(`${getMessageFromError(error)}`)
      })
  }

  return (
    <>
      <div className={styles.container}>
        <Button kind="ghost" size="md" renderIcon={Popup16} onClick={openModal}>
          Datasources
        </Button>
        {manuscriptId && (
          <Link target="_blank" href={`/manuscript/${manuscriptId}`} renderIcon={Launch16}>
            Preview manuscript
          </Link>
        )}
        {manuscriptId && (
          <Form onSubmit={onDelete} className={styles.deleteManuscript}>
            <Button type="submit" kind="danger" size="sm" renderIcon={TrashCan16}>
              Delete manuscript
            </Button>
          </Form>
        )}
      </div>
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
              taskStatus === "active" ? "Status" : taskStatus === "finished" ? "Success!" : "Error!"
            }
          />
        </div>
      )}
      {!manuscriptId && (
        <Form onSubmit={onUpload}>
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
          <Button type="submit" kind="tertiary" size="sm" renderIcon={Upload16}>
            Upload manuscript
          </Button>
        </Form>
      )}
      <Modal
        className="ar--datasource-modal"
        aria-label="Datasources"
        open={modalIsOpen}
        modalLabel="Datasources"
        modalHeading="Copy datasource URL"
        passiveModal={true}
        size="xs"
        hasScrollingContent={true}
        preventCloseOnClickOutside={true}
        onRequestClose={closeModal}
      >
        <Link
          href={`${serverUrl}/dataset.xhtml?persistentId=${doi}`}
          target="_blank"
          rel="noopener noreferrer"
          size="lg"
        >
          Modify datasources
        </Link>
        {datasources.length === 0 && (
          <div className={styles.infotext}>No datasources found for this project.</div>
        )}
        {datasources.map(({ id, name, uri }) => (
          <div key={id} className={styles.datasource}>
            <Link target="_blank" rel="noopener noreferrer" size="lg" href={uri}>
              {name}
            </Link>
            <CopyToClipboard key={id} text={uri}>
              <CopyButton
                feedback="Copied!"
                feedbackTimeout={3000}
                iconDescription="Copy URL to clipboard"
              />
            </CopyToClipboard>
          </div>
        ))}
      </Modal>
      {manuscriptId && (
        <iframe
          className={styles.iframe}
          id={`manuscript__${manuscriptId}`}
          title="manuscript"
          src={`/manuscript/${manuscriptId}`}
          width="100%"
        />
      )}
    </>
  )
}

export default AtiManuscript
