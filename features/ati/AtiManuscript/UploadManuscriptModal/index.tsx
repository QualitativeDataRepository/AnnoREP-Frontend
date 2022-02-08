import { FC } from "react"

import { ComposedModal, ModalBody, ModalHeader, ModalFooter } from "carbon-components-react"

export interface UploadManuscriptModalProps {
  /** The manuscript name */
  manuscriptName: string
  /** Upload annotations from the user uploaded manuscript? */
  uploadAnnotations: boolean
  /** Is the modal open? */
  open: boolean
  /** Callback to close the modal */
  closeModal(): void
  /** Callback to upload a manuscript */
  handleUploadManuscript(): void
}

const UploadManuscriptModal: FC<UploadManuscriptModalProps> = ({
  manuscriptName,
  uploadAnnotations,
  open,
  closeModal,
  handleUploadManuscript,
}) => {
  const onRequestSubmit = () => handleUploadManuscript()
  return (
    <ComposedModal
      open={open}
      onClose={closeModal}
      size="sm"
      aria-label="Upload manuscript confirmation"
    >
      <ModalHeader
        id="upload-manuscript-modal-header"
        title={`${
          uploadAnnotations ? "Start with new" : "Ignore"
        } annotations from ${manuscriptName}?`}
        iconDescription="Close"
      />
      <ModalBody id="upload-manuscript-modal-body">
        {uploadAnnotations
          ? `All your current annotations will be deleted and replaced with the annotations found in ${manuscriptName}.`
          : `No annotations from ${manuscriptName} will be uploaded.`}
      </ModalBody>
      <ModalFooter
        id="upload-manuscript-modal-footer"
        primaryButtonText="Continue"
        secondaryButtonText="Cancel"
        onRequestSubmit={onRequestSubmit}
      />
    </ComposedModal>
  )
}

export default UploadManuscriptModal
