import { FC } from "react"

import { ComposedModal, ModalBody, ModalHeader, ModalFooter } from "@carbon/react"

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
    <ComposedModal
      open={open}
      onClose={closeModal}
      size="xs"
      aria-label="Delete manuscript confirmation"
    >
      <ModalHeader title={`Delete ${manuscriptName}`} iconDescription="Close" />
      <ModalBody>Are you sure you want to delete this manuscript?</ModalBody>
      <ModalFooter
        danger
        primaryButtonText="Continue"
        secondaryButtonText="Cancel"
        onRequestSubmit={onRequestSubmit}
      >
        {null}
      </ModalFooter>
    </ComposedModal>
  )
}

export default DeleteManuscriptModal
