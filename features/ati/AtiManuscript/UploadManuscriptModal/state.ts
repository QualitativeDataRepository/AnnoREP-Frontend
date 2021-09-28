export interface UploadManuscriptState {
  manuscript?: File
  /**Replace current annotations with the annotations found in manuscript? */
  uploadAnnotations: boolean
  modalIsOpen: boolean
}

export interface Action {
  type: "UPLOAD" | "TOGGLE_MODAL_IS_OPEN"
  payload?: {
    manuscript: File
    uploadAnnotations: boolean
  }
}

export function uploadManuscriptReducer(
  state: UploadManuscriptState,
  action: Action
): UploadManuscriptState {
  switch (action.type) {
    case "UPLOAD": {
      return {
        manuscript: action.payload?.manuscript,
        uploadAnnotations: action.payload?.uploadAnnotations as boolean,
        modalIsOpen: true,
      }
    }
    case "TOGGLE_MODAL_IS_OPEN": {
      return {
        ...state,
        modalIsOpen: !state.modalIsOpen,
      }
    }
    default: {
      return state
    }
  }
}
