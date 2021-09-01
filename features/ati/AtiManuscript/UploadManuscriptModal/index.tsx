import { FC } from "react"

import { ComposedModal, ModalBody, ModalHeader, ModalFooter } from "carbon-components-react"

interface UploadManuscriptModalProps {
  manuscriptName: string
  uploadAnnotations: boolean
  open: boolean
  closeModal(): void
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
    <ComposedModal open={open} onClose={closeModal} size="sm">
      <ModalHeader
        id="upload-manuscript-modal-header"
        title={`${
          uploadAnnotations ? "Start with new" : "Ignore"
        } annotations from ${manuscriptName}?`}
        iconDescription="Close"
      />
      <ModalBody id="upload-manuscript-modal-body" aria-label="Upload manuscript confirmation">
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
