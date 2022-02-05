import { NotificationKind } from "carbon-components-react"

import { ITaskState } from "./state"

export function getTaskStatus(state: ITaskState): string {
  const { status } = state
  return status === "active" ? "Status" : status === "finished" ? "Success!" : "Error!"
}

export function getTaskNotificationKind(state: ITaskState): NotificationKind {
  const { status } = state
  return status === "active" ? "info" : status === "finished" ? "success" : "error"
}
