import { useReducer } from "react"

export enum CredentialActionType {
  UPDATE,
  VALIDATE,
}

export type ICredentialAction =
  | { type: CredentialActionType.UPDATE; payload: string }
  | { type: CredentialActionType.VALIDATE; payload: { isInvalid: boolean; invalidText: string } }

interface ICredentialState {
  credential: string
  isInvalid: boolean
  invalidText: string
}

export function credentialReducer(
  state: ICredentialState,
  action: ICredentialAction
): ICredentialState {
  switch (action.type) {
    case CredentialActionType.UPDATE: {
      return {
        ...state,
        credential: action.payload,
      }
    }
    case CredentialActionType.VALIDATE: {
      return {
        ...state,
        isInvalid: action.payload.isInvalid,
        invalidText: action.payload.invalidText,
      }
    }
  }
}

export const initialCredentialState: ICredentialState = {
  credential: "",
  isInvalid: false,
  invalidText: "",
}

export default function useCredential(initialCredentialState: ICredentialState): {
  state: ICredentialState
  dispatch: React.Dispatch<ICredentialAction>
} {
  const [state, dispatch] = useReducer(credentialReducer, initialCredentialState)
  return { state, dispatch }
}
