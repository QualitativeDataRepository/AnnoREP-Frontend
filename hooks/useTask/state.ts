import { InlineLoadingStatus } from "carbon-components-react"

export interface ITaskState {
  status: InlineLoadingStatus
  desc: string
}

export enum TaskActionType {
  START = "START",
  FINISH = "FINISH",
  FAIL = "FAIL",
  NEXT_STEP = "NEXT_STEP",
  RESET = "RESET",
}

export type ITaskAction =
  | { type: TaskActionType.START; payload: string }
  | { type: TaskActionType.FINISH; payload: string }
  | { type: TaskActionType.FAIL; payload: string }
  | { type: TaskActionType.NEXT_STEP; payload: string }
  | { type: TaskActionType.RESET }

export function taskReducer(state: ITaskState, action: ITaskAction): ITaskState {
  switch (action.type) {
    case TaskActionType.START: {
      return {
        ...state,
        status: "active",
        desc: action.payload,
      }
    }
    case TaskActionType.FINISH: {
      return {
        ...state,
        status: "finished",
        desc: action.payload,
      }
    }
    case TaskActionType.FAIL: {
      return {
        ...state,
        status: "error",
        desc: action.payload,
      }
    }
    case TaskActionType.NEXT_STEP: {
      return {
        ...state,
        desc: action.payload,
      }
    }
    case TaskActionType.RESET: {
      return {
        ...state,
        status: "inactive",
        desc: "",
      }
    }
    default: {
      return state
    }
  }
}
