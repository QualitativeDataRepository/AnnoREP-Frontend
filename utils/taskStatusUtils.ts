import { InlineLoadingStatus, NotificationKind } from "carbon-components-react"

export function getTaskStatus(status: InlineLoadingStatus): string {
  return status === "active" ? "Status" : status === "finished" ? "Success!" : "Error!"
}

export function getTaskNotificationKind(status: InlineLoadingStatus): NotificationKind {
  return status === "active" ? "info" : status === "finished" ? "success" : "error"
}
