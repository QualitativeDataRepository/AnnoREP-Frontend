import { FC } from "react"

import { InlineNotification, NotificationActionButton } from "carbon-components-react"

const HypothesisLoginNotification: FC = () => {
  return (
    <InlineNotification
      hideCloseButton
      lowContrast
      kind="info"
      statusIconDescription="info"
      title="Log in to Hypothes.is to see your annotations in the Annotation sidebar."
      actions={<NotificationActionButton>OK</NotificationActionButton>}
    />
  )
}

export default HypothesisLoginNotification
