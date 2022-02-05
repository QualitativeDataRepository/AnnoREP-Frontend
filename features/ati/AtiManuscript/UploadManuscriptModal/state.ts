export interface IUploadManuscriptState {
  manuscript: File | null
  /**Replace current annotations with the annotations found in manuscript? */
  uploadAnnotations: boolean
  modalIsOpen: boolean
}

export enum UploadManuscriptActionType {
  TOGGLE_MODAL_VISIBILITY = "TOGGLE_MODAL_VISIBILITY",
  SAVE_FILE_SELECTION = "SAVE_FILE_SELECTION",
  CLEAR_FILE_SELECTION = "CLEAR_FILE_SELECTION",
  SAVE_VALID_UPLOAD_CONFIG = "SAVE_VALID_UPLOAD_CONFIG",
}

export type IUploadManuscriptAction =
  | { type: UploadManuscriptActionType.TOGGLE_MODAL_VISIBILITY }
  | { type: UploadManuscriptActionType.SAVE_FILE_SELECTION; payload: File }
  | { type: UploadManuscriptActionType.CLEAR_FILE_SELECTION }
  | {
      type: UploadManuscriptActionType.SAVE_VALID_UPLOAD_CONFIG
      payload: {
        manuscript: File
        uploadAnnotations: boolean
      }
    }

export function uploadManuscriptReducer(
  state: IUploadManuscriptState,
  action: IUploadManuscriptAction
): IUploadManuscriptState {
  switch (action.type) {
    case UploadManuscriptActionType.SAVE_VALID_UPLOAD_CONFIG: {
      return {
        manuscript: action.payload.manuscript,
        uploadAnnotations: action.payload.uploadAnnotations,
        modalIsOpen: true,
      }
    }
    case UploadManuscriptActionType.TOGGLE_MODAL_VISIBILITY: {
      return {
        ...state,
        modalIsOpen: !state.modalIsOpen,
      }
    }
    case UploadManuscriptActionType.SAVE_FILE_SELECTION: {
      return {
        ...state,
        manuscript: action.payload,
      }
    }
    case UploadManuscriptActionType.CLEAR_FILE_SELECTION: {
      return {
        ...state,
        manuscript: null,
      }
    }
    default: {
      return state
    }
  }
}
