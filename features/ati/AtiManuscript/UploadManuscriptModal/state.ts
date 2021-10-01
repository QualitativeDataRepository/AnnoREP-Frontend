export interface UploadManuscriptState {
  manuscript: File | null
  /**Replace current annotations with the annotations found in manuscript? */
  uploadAnnotations: boolean
  modalIsOpen: boolean
}

export type Action =
  | { type: "TOGGLE_MODAL_IS_OPEN" }
  | { type: "SET_MANUSCRIPT"; payload: File | null }
  | {
      type: "UPLOAD_MANUSCRIPT"
      payload: {
        manuscript: File
        uploadAnnotations: boolean
      }
    }

export function uploadManuscriptReducer(
  state: UploadManuscriptState,
  action: Action
): UploadManuscriptState {
  switch (action.type) {
    case "UPLOAD_MANUSCRIPT": {
      return {
        manuscript: action.payload.manuscript,
        uploadAnnotations: action.payload.uploadAnnotations,
        modalIsOpen: true,
      }
    }
    case "TOGGLE_MODAL_IS_OPEN": {
      return {
        ...state,
        modalIsOpen: !state.modalIsOpen,
      }
    }
    case "SET_MANUSCRIPT": {
      return {
        ...state,
        manuscript: action.payload,
      }
    }
    default: {
      return state
    }
  }
}
