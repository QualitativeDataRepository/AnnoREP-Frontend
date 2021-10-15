import { FC } from "react"

import { InlineNotification, NotificationActionButton } from "carbon-components-react"

const HypothesisLoginNotification: FC = () => {
  return (
    <InlineNotification
      hideCloseButton
      lowContrast
      kind="info"
      statusIconDescription="info"
      title="Use the Annotation sidebar to log in to Hypothes.is and see your annotations"
      actions={<NotificationActionButton>OK</NotificationActionButton>}
    />
  )
}

export default HypothesisLoginNotification
