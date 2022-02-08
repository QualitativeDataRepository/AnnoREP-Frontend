import { FC } from "react"

import { ComposedModal, ModalBody, ModalHeader, ModalFooter } from "carbon-components-react"

export interface DeleteAnnotationsModalProps {
  /** The manuscript name */
  manuscriptName: string
  /** Is the modal open? */
  open: boolean
  /** Callback to close the modal */
  closeModal(): void
  /** Callback to delete the annotations */
  handleDeleteAnnotations(): void
}

const DeleteAnnotations: FC<DeleteAnnotationsModalProps> = ({
  manuscriptName,
  open,
  closeModal,
  handleDeleteAnnotations,
}) => {
  const onRequestSubmit = () => handleDeleteAnnotations()
  return (
    <ComposedModal
      open={open}
      onClose={closeModal}
      size="xs"
      aria-label="Delete annotations confirmation"
    >
      <ModalHeader
        id="delete-annotations-modal-header"
        title={`Delete annotations from ${manuscriptName}`}
        iconDescription="Close"
      />
      <ModalBody id="delete-annotations-modal-body">
        Are you sure you want to delete annotations from this manuscript?
      </ModalBody>
      <ModalFooter
        id="delete-annotations-modal-footer"
        danger
        primaryButtonText="Continue"
        secondaryButtonText="Cancel"
        onRequestSubmit={onRequestSubmit}
      />
    </ComposedModal>
  )
}

export default DeleteAnnotations
