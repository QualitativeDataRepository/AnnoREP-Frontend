import { FC, FormEventHandler, useState } from "react"

import { Button, TooltipIcon, Form, FileUploader } from "carbon-components-react"
import { Panel, PanelType } from "@fluentui/react"
import { useBoolean } from "@fluentui/react-hooks"
import { CopyToClipboard } from "react-copy-to-clipboard"
import { Copy32, Popup16, TrashCan16, Upload16 } from "@carbon/icons-react"

import { IDatasource } from "../../../types/dataverse"

import styles from "./AtiManuscript.module.css"

interface AtiManuscriptProps {
  //need dataset id for upload new manu
  //internal api call? dont wanna use session on frontend
  //differet api struct
  //api/ati/id/manscript/ post or delete
  //file upload has to me form
  //just form that has delete or upload? wher to put it? in relation to datasources button
  datasetId: string
  datasources: IDatasource[]
  manuscriptId?: string
}

const AtiManuscript: FC<AtiManuscriptProps> = ({ manuscriptId, datasources }) => {
  const [isOpen, { setTrue: openPanel, setFalse: dismissPanel }] = useBoolean(false)
  const [copiedUri, setCopiedUri] = useState("")

  const onDelete: FormEventHandler<HTMLFormElement> = (e) => {
    e.preventDefault()
    //api call delete both original and clean manu
  }

  const onUpload: FormEventHandler<HTMLFormElement> = (e) => {
    e.preventDefault()
    //api call upload file
  }

  return (
    <>
      <Form encType="multipart/form-data" onSubmit={manuscriptId ? onDelete : onUpload}>
        {manuscriptId ? (
          <div className={styles.buttoncontainer}>
            <Button kind="ghost" size="md" renderIcon={Popup16} onClick={openPanel}>
              Datasources
            </Button>
            <Button type="submit" kind="danger" size="sm" renderIcon={TrashCan16}>
              Delete manuscript
            </Button>
          </div>
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
      <Panel
        type={PanelType.customNear}
        customWidth={"300px"}
        headerText="Datasources"
        isBlocking={false}
        isOpen={isOpen}
        onDismiss={dismissPanel}
        closeButtonAriaLabel="Close"
      >
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
