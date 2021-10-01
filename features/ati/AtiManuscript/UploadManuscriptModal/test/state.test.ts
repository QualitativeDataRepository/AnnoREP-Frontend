import { uploadManuscriptReducer, UploadManuscriptState } from "../state"

describe("uploadManuscriptReducer", () => {
  const initialState: UploadManuscriptState = {
    manuscript: null,
    modalIsOpen: false,
    uploadAnnotations: false,
  }

  test("handles upload", () => {
    expect(
      uploadManuscriptReducer(initialState, {
        type: "UPLOAD_MANUSCRIPT",
        payload: { manuscript: new File([new ArrayBuffer(1)], "test"), uploadAnnotations: false },
      })
    ).toEqual({
      modalIsOpen: true,
      manuscript: new File([new ArrayBuffer(1)], "test"),
      uploadAnnotations: false,
    })
  })

  test("handles set manuscript", () => {
    expect(
      uploadManuscriptReducer(initialState, {
        type: "SET_MANUSCRIPT",
        payload: new File([new ArrayBuffer(1)], "test"),
      })
    ).toEqual({
      ...initialState,
      manuscript: new File([new ArrayBuffer(1)], "test"),
    })

    expect(
      uploadManuscriptReducer(initialState, {
        type: "SET_MANUSCRIPT",
        payload: null,
      })
    ).toEqual({
      ...initialState,
      manuscript: null,
    })
  })

  test("handles toggle modal is open", () => {
    expect(
      uploadManuscriptReducer(initialState, {
        type: "TOGGLE_MODAL_IS_OPEN",
      })
    ).toEqual({
      ...initialState,
      modalIsOpen: true,
    })
  })
})
