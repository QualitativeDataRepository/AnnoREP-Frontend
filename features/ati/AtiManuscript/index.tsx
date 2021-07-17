import { FC, FormEventHandler, useState, useRef } from "react"

import axios from "axios"
import {
  Button,
  TooltipIcon,
  Form,
  FileUploader,
  Link,
  Loading,
  InlineNotification,
} from "carbon-components-react"
import { Panel, PanelType } from "@fluentui/react"
import { useBoolean } from "@fluentui/react-hooks"
import FormData from "form-data"
import { CopyToClipboard } from "react-copy-to-clipboard"
import { Copy32, Popup16, TrashCan16, Upload16 } from "@carbon/icons-react"

import { IDatasource } from "../../../types/dataverse"
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
  const [isOpen, { setTrue: openPanel, setFalse: dismissPanel }] = useBoolean(false)
  const [copiedUri, setCopiedUri] = useState("")
  const [isLoading, setIsLoading] = useState<boolean>(false)
  const [errorMsg, setErrorMsg] = useState<string>("")
  const [mId, setMId] = useState(manuscriptId)
  const mIdRef = useRef("")

  const onDelete: FormEventHandler<HTMLFormElement> = async (e) => {
    e.preventDefault()
    const id = mId as string
    setIsLoading(true)
    setErrorMsg("")
    await axios
      .delete(`/api/delete-file/${id}`)
      .then(() => {
        setIsLoading(false)
        setMId("")
      })
      .catch((error) => {
        setIsLoading(false)
        setErrorMsg(`${getMessageFromError(error)}`)
      })
  }

  const onUpload: FormEventHandler<HTMLFormElement> = async (e) => {
    e.preventDefault()
    const target = e.target as typeof e.target & {
      manuscript: { files: FileList }
    }
    const formData = new FormData()
    formData.append("manuscript", target.manuscript.files[0])
    setIsLoading(true)
    setErrorMsg("")
    await axios({
      method: "POST",
      url: `/api/datasets/${datasetId}/manuscript`,
      data: formData,
      headers: {
        "Content-Type": "multipart/form-data",
      },
    })
      .then(({ data }) => {
        const newManuscriptId = data.files[0].dataFile.id
        mIdRef.current = newManuscriptId
        return axios({
          method: "PUT",
          url: `/api/arcore/${newManuscriptId}`,
        })
      })
      .then(() => {
        setIsLoading(false)
        setMId(mIdRef.current)
      })
      .catch((error) => {
        setIsLoading(false)
        setErrorMsg(`${getMessageFromError(error)}`)
      })
  }

  return (
    <>
      {isLoading && <Loading description="Uploading manuscript" />}
      <div className={styles.container}>
        <Form encType="multipart/form-data" onSubmit={mId ? onDelete : onUpload}>
          {errorMsg && (
            <div className="ar--form-item">
              <InlineNotification
                hideCloseButton
                kind="error"
                subtitle={<span>{errorMsg}</span>}
                title="Error"
              />
            </div>
          )}
          {mId ? (
            <Button type="submit" kind="danger" size="sm" renderIcon={TrashCan16}>
              Delete manuscript
            </Button>
          ) : (
            <>
              <div className="ar--form-item">
                <FileUploader
                  aria-required={true}
                  accept={[".docx, .pdf"]}
                  buttonKind="tertiary"
                  buttonLabel="Add file"
                  filenameStatus="edit"
                  iconDescription="Clear file"
                  labelDescription="Supported file types are .docx and .pdf."
                  labelTitle="Upload manuscript"
                  name="manuscript"
                  size="small"
                />
              </div>
              <Button type="submit" kind="tertiary" size="sm" renderIcon={Upload16}>
                Upload manuscript
              </Button>
            </>
          )}
        </Form>
        <Button kind="ghost" size="md" renderIcon={Popup16} onClick={openPanel}>
          Datasources
        </Button>
      </div>
      <Panel
        type={PanelType.customNear}
        customWidth={"300px"}
        headerText="Datasources"
        isBlocking={false}
        isOpen={isOpen}
        onDismiss={dismissPanel}
        closeButtonAriaLabel="Close"
      >
        <Link
          href={`${serverUrl}/dataset.xhtml?persistentId=${doi}`}
          target="_blank"
          rel="noopener noreferrer"
          size="lg"
        >
          Modify datasources
        </Link>
        <div className={styles.infotext}>{`${copiedUri} ${copiedUri ? "copied!" : ""}`}</div>
        {datasources.length === 0 && (
          <div className={styles.infotext}>No datasources found for this project.</div>
        )}
        {datasources.map(({ id, name, uri }) => (
          <div key={id} className={styles.datasource}>
            <div>
              <div className={styles.name}>{name}</div>
              <span className={styles.uri}>{uri}</span>
            </div>
            <CopyToClipboard key={id} text={uri} onCopy={() => setCopiedUri(uri)}>
              <TooltipIcon direction="top" align="end" tooltipText="Copy URI">
                <Copy32 />
              </TooltipIcon>
            </CopyToClipboard>
          </div>
        ))}
      </Panel>
      {mId && (
        <iframe
          className={styles.iframe}
          id={`manuscript__${mId}`}
          title="manuscript"
          src={`/manuscript/${mId}`}
          width="100%"
        />
      )}
    </>
  )
}

export default AtiManuscript
