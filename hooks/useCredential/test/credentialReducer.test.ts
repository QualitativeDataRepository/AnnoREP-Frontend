import { CredentialActionType, initialCredentialState, credentialReducer } from ".."

describe("credentialReducer", () => {
  test("handles update", () => {
    expect(
      credentialReducer(initialCredentialState, {
        type: CredentialActionType.UPDATE,
        payload: "test",
      })
    ).toEqual({
      ...initialCredentialState,
      credential: "test",
    })
  })

  test("handles validate", () => {
    expect(
      credentialReducer(initialCredentialState, {
        type: CredentialActionType.VALIDATE,
        payload: { isInvalid: true, invalidText: "test" },
      })
    ).toEqual({
      ...initialCredentialState,
      isInvalid: true,
      invalidText: "test",
    })
  })
})
