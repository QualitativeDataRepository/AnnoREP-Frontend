import { FC } from "react"

import { ComposedModal, ModalBody, ModalHeader, ModalFooter } from "carbon-components-react"

export interface DeleteAtiModalProps {
  /** The ati project name */
  atiName: string
  /** Is the modal open? */
  open: boolean
  /** Callback to close the modal */
  closeModal(): void
  /** Callback to delete the ati project */
  handleDeleteAti(): void
}

const DeleteAtiModal: FC<DeleteAtiModalProps> = ({
  atiName,
  open,
  closeModal,
  handleDeleteAti,
}) => {
  const onRequestSubmit = () => handleDeleteAti()
  return (
    <ComposedModal
      open={open}
      onClose={closeModal}
      size="xs"
      aria-label="Delete ATI project confirmation"
    >
      <ModalHeader
        id="delete-ati-modal-header"
        title={`Delete ${atiName}`}
        iconDescription="Close"
      />
      <ModalBody id="delete-ati-modal-body">
        Are you sure you want to delete this project?
      </ModalBody>
      <ModalFooter
        id="delete-ati-modal-footer"
        danger
        primaryButtonText="Continue"
        secondaryButtonText="Cancel"
        onRequestSubmit={onRequestSubmit}
      />
    </ComposedModal>
  )
}

export default DeleteAtiModal
