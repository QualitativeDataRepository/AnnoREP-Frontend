import React, { FC, useState } from "react"

import axios from "axios"
import { Renew20 } from "@carbon/icons-react"
import {
  ComposedModal,
  ModalBody,
  ModalHeader,
  Link,
  InlineNotification,
  CopyButton,
  Button,
  InlineLoading,
} from "carbon-components-react"
import CopyToClipboard from "react-copy-to-clipboard"

import useTask, { TaskActionType } from "../../../../hooks/useTask"

import Datasource from "./Datasource"

import { IDatasource } from "../../../../types/dataverse"
import { getMessageFromError } from "../../../../utils/httpRequestUtils"

import styles from "./DatasourceModal.module.css"

export interface DatasourceModalProps {
  /** The id of the dataset */
  datasetId: string
  /** Is the datasource modal open? */
  open: boolean
  /** The list of datasources */
  datasources: IDatasource[]
  /** The dataverse server url */
  serverUrl: string
  /** The dataset doi */
  datasetDoi: string
  /** Callback to close the modal */
  closeModal(): void
}

const DatasourceModal: FC<DatasourceModalProps> = ({
  datasetId,
  open,
  datasources,
  serverUrl,
  datasetDoi,
  closeModal,
}) => {
  const { state: taskState, dispatch: taskDispatch } = useTask({ status: "inactive", desc: "" })
  const [datasourcesState, setDatasourcesState] = useState(datasources)

  const handleRefreshDatasources = async () => {
    taskDispatch({ type: TaskActionType.START, payload: "" })
    await axios
      .get(`/api/datasets/${datasetId}/data-files`)
      .then(({ data }) => {
        taskDispatch({ type: TaskActionType.FINISH, payload: "" })
        setTimeout(() => taskDispatch({ type: TaskActionType.RESET }), 2000 /** 2s */)
        setDatasourcesState(data)
      })
      .catch((error) => {
        console.warn(getMessageFromError(error))
        taskDispatch({ type: TaskActionType.FAIL, payload: "" })
        setTimeout(() => taskDispatch({ type: TaskActionType.RESET }), 3000 /** 3s */)
      })
  }

  return (
    <ComposedModal
      className={styles.datasourceModal}
      open={open}
      preventCloseOnClickOutside={true}
      onClose={closeModal}
    >
      <ModalHeader
        id="datasources-modal-header"
        label="Data sources"
        title="Copy the data source URL and paste it into an annotation on the right"
        iconDescription="Close"
      />
      <ModalBody
        id="datasources-modal-body"
        aria-label="Data source URLs"
        hasScrollingContent={true}
      >
        <div className={styles.twoColumns} aria-live="assertive">
          <Link
            href={`${serverUrl}/dataset.xhtml?persistentId=${datasetDoi}`}
            target="_blank"
            rel="noopener noreferrer"
            size="lg"
            disabled={taskState.status === "active"}
          >
            Add/remove associated data sources
          </Link>
          {taskState.status !== "inactive" ? (
            <InlineLoading
              className={styles.inlineLoading}
              status={taskState.status}
              description={taskState.desc}
            />
          ) : (
            <Button
              hasIconOnly
              kind="ghost"
              size="md"
              iconDescription="Refresh"
              tooltipPosition="bottom"
              tooltipAlignment="center"
              renderIcon={Renew20}
              onClick={() => handleRefreshDatasources()}
            />
          )}
        </div>
        {datasourcesState.length === 0 && (
          <InlineNotification
            hideCloseButton
            lowContrast
            kind="info"
            title="This project has no data sources."
          />
        )}
        <div
          className={`${styles.datasources} ${styles.twoColumns}`}
          aria-live="assertive"
          aria-relevant="additions removals"
        >
          {datasourcesState.map(({ id, name, uri }) => (
            <React.Fragment key={id}>
              <Datasource name={name} />
              <CopyToClipboard key={id} text={uri}>
                <CopyButton
                  feedback="Copied!"
                  feedbackTimeout={3000}
                  iconDescription="Copy URL to clipboard"
                />
              </CopyToClipboard>
            </React.Fragment>
          ))}
        </div>
      </ModalBody>
    </ComposedModal>
  )
}

export default DatasourceModal
