import { FC, useState, useEffect } from "react"

import { InlineNotification, NotificationActionButton } from "carbon-components-react"

const HYPOTHESIS_LOGIN_NOTIFICATION_IS_VISIBLE = "hypotheis-login-notification-is-visible"

const HypothesisLoginNotification: FC = () => {
  const [notificationIsVisible, setNotificationIsVisible] = useState(false)

  const onClickOK = () => {
    localStorage.setItem(HYPOTHESIS_LOGIN_NOTIFICATION_IS_VISIBLE, "false")
    setNotificationIsVisible(false)
  }

  useEffect(() => {
    const isVisible = localStorage.getItem(HYPOTHESIS_LOGIN_NOTIFICATION_IS_VISIBLE)
    if (isVisible === null || isVisible === "true") {
      setNotificationIsVisible(true)
    }
  }, [])

  if (notificationIsVisible) {
    return (
      <InlineNotification
        hideCloseButton
        lowContrast
        kind="warning-alt"
        statusIconDescription="warning"
        title="Log in to Hypothes.is in the Annotation sidebar to the right to see your annotations."
        actions={<NotificationActionButton onClick={onClickOK}>OK</NotificationActionButton>}
      />
    )
  }

  return null
}

export default HypothesisLoginNotification
