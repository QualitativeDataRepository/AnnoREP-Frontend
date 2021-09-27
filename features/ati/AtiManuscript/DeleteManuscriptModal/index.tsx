import { FC } from "react"

import { ComposedModal, ModalBody, ModalHeader, ModalFooter } from "carbon-components-react"

export interface DeleteManuscriptModalProps {
  /** The manuscript name */
  manuscriptName: string
  /** Is the modal open? */
  open: boolean
  /** Callback to close the modal */
  closeModal(): void
  /** Callback to delete the manuscript */
  handleDeleteManuscript(): void
}

const DeleteManuscriptModal: FC<DeleteManuscriptModalProps> = ({
  manuscriptName,
  open,
  closeModal,
  handleDeleteManuscript,
}) => {
  const onRequestSubmit = () => handleDeleteManuscript()
  return (
    <ComposedModal open={open} onClose={closeModal} size="xs">
      <ModalHeader
        id="delete-manuscript-modal-header"
        title={`Delete ${manuscriptName}`}
        iconDescription="Close"
      />
      <ModalBody id="delete-manuscript-modal-body" aria-label="Delete manuscript confirmation">
        Are you sure you want to delete this manuscript?
      </ModalBody>
      <ModalFooter
        id="delete-manuscript-modal-footer"
        danger
        primaryButtonText="Continue"
        secondaryButtonText="Cancel"
        onRequestSubmit={onRequestSubmit}
      />
    </ComposedModal>
  )
}

export default DeleteManuscriptModal
