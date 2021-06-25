import { FC, useEffect, useRef, useState } from "react"

import { Button, TooltipIcon } from "carbon-components-react"
import { Panel, PanelType } from "@fluentui/react"
import { useBoolean } from "@fluentui/react-hooks"
import { CopyToClipboard } from "react-copy-to-clipboard"
import { Copy32, Popup16 } from "@carbon/icons-react"

import { IDatasource } from "../../../types/dataverse"

import styles from "./AtiManuscript.module.css"

interface AtiManuscriptProps {
  isSelected: boolean
  manuscriptId: string
  datasources: IDatasource[]
}

const AtiManuscript: FC<AtiManuscriptProps> = ({ isSelected, manuscriptId, datasources }) => {
  const iframeRef = useRef<HTMLIFrameElement>(null)
  const [iframeHeight, setIframeHeight] = useState(1)
  const [isOpen, { setTrue: openPanel, setFalse: dismissPanel }] = useBoolean(false)
  const [copiedUri, setCopiedUri] = useState("")
  /*const onLoad: ReactEventHandler<HTMLIFrameElement> = (event) => {
    //event.currentTarget.style.height = `${event.currentTarget.contentWindow?.document.body.scrollHeight}px`
    console.log("in", `${event.currentTarget.contentWindow?.document.body.scrollHeight}px`)
    //setIframeHeight(event.currentTarget.contentWindow?.document.body.scrollHeight as number)
  }*/

  /*useEffect(() => {
    const height = iframeRef.current?.contentWindow?.document.body.scrollHeight
    console.log("height", height)
    setIframeHeight(height as number)
  }, [isSelected])*/

  useEffect(() => {
    const height = iframeRef.current?.contentWindow?.document.body.scrollHeight
    //console.log("height2", height)
    //TODO, FIX
    setIframeHeight(height as number)
  }, [isSelected])

  return (
    <>
      <Button kind="ghost" size="md" renderIcon={Popup16} onClick={openPanel}>
        Datasources
      </Button>
      <Panel
        type={PanelType.customNear}
        customWidth={"300px"}
        headerText="Datasources"
        isBlocking={false}
        isOpen={isOpen}
        onDismiss={dismissPanel}
        closeButtonAriaLabel="Close"
      >
        <div className={styles.copiedtext}>{`${copiedUri} ${copiedUri ? "copied!" : ""}`}</div>
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
      <iframe
        id={`manuscript__${manuscriptId}`}
        ref={iframeRef}
        title="manuscript"
        src={`/manuscript/${manuscriptId}`}
        width="100%"
        height={iframeHeight}
      />
    </>
  )
}

export default AtiManuscript
