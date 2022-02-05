import { Dispatch, useReducer } from "react"

import { ITaskAction, ITaskState, taskReducer } from "./state"

export { TaskActionType } from "./state"
export { getTaskNotificationKind, getTaskStatus } from "./selectors"

interface IUseTask {
  state: ITaskState
  dispatch: Dispatch<ITaskAction>
}

export default function useTask(initialTaskState: ITaskState): IUseTask {
  const [state, dispatch] = useReducer(taskReducer, initialTaskState)
  return { state, dispatch }
}
