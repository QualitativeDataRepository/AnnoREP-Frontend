import { FC } from "react"

import { ComposedModal, ModalBody, ModalHeader, ModalFooter } from "@carbon/react"

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
      <ModalHeader title={`Delete annotations from ${manuscriptName}`} iconDescription="Close" />
      <ModalBody>Are you sure you want to delete annotations from this manuscript?</ModalBody>
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

export default DeleteAnnotations
