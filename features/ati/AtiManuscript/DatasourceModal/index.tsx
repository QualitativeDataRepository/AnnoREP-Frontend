import { FC } from "react"

import {
  ComposedModal,
  ModalBody,
  ModalHeader,
  Link,
  InlineNotification,
  CopyButton,
} from "carbon-components-react"
import CopyToClipboard from "react-copy-to-clipboard"

import { IDatasource } from "../../../../types/dataverse"

import styles from "./DatasourceModal.module.css"

export interface DatasourceModalProps {
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
  open,
  datasources,
  serverUrl,
  datasetDoi,
  closeModal,
}) => {
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
        <Link
          href={`${serverUrl}/dataset.xhtml?persistentId=${datasetDoi}`}
          target="_blank"
          rel="noopener noreferrer"
          size="lg"
        >
          Add/remove associated data sources
        </Link>
        {datasources.length === 0 && (
          <InlineNotification
            hideCloseButton
            lowContrast
            kind="info"
            title="This project has no data sources."
          />
        )}
        {datasources.map(({ id, name, uri }) => (
          <div key={id} className={styles.datasource}>
            <p>{name}</p>
            <CopyToClipboard key={id} text={uri}>
              <CopyButton
                feedback="Copied!"
                feedbackTimeout={3000}
                iconDescription="Copy URL to clipboard"
              />
            </CopyToClipboard>
          </div>
        ))}
      </ModalBody>
    </ComposedModal>
  )
}

export default DatasourceModal
