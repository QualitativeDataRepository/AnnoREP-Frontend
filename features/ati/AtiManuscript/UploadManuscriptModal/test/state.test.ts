import {
  uploadManuscriptReducer,
  IUploadManuscriptState,
  UploadManuscriptActionType,
} from "../state"

describe("uploadManuscriptReducer", () => {
  const initialState: IUploadManuscriptState = {
    manuscript: null,
    modalIsOpen: false,
    uploadAnnotations: false,
  }

  test("handles save valid upload config", () => {
    expect(
      uploadManuscriptReducer(initialState, {
        type: UploadManuscriptActionType.SAVE_VALID_UPLOAD_CONFIG,
        payload: { manuscript: new File([new ArrayBuffer(1)], "test"), uploadAnnotations: false },
      })
    ).toEqual({
      modalIsOpen: true,
      manuscript: new File([new ArrayBuffer(1)], "test"),
      uploadAnnotations: false,
    })
  })

  test("handles save/clear file selection", () => {
    expect(
      uploadManuscriptReducer(initialState, {
        type: UploadManuscriptActionType.SAVE_FILE_SELECTION,
        payload: new File([new ArrayBuffer(1)], "test"),
      })
    ).toEqual({
      ...initialState,
      manuscript: new File([new ArrayBuffer(1)], "test"),
    })

    expect(
      uploadManuscriptReducer(initialState, {
        type: UploadManuscriptActionType.CLEAR_FILE_SELECTION,
      })
    ).toEqual({
      ...initialState,
      manuscript: null,
    })
  })

  test("handles toggle modal visibility", () => {
    expect(
      uploadManuscriptReducer(initialState, {
        type: UploadManuscriptActionType.TOGGLE_MODAL_VISIBILITY,
      })
    ).toEqual({
      ...initialState,
      modalIsOpen: true,
    })
  })
})
