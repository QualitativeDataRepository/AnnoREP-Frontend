import { FC } from "react"

interface AtiPublishManuscriptProps {
  manuscriptId: string
}
//TODO: get arcore/source-manuscript-id/pdf, so user can upload it to publish destination
//api call to get most recent annoations from hypo, using user hypo api token
//api call to send annotations to new manuscription url, using qdr-user hypo api token
//ui has to link to publish dataset
//ui has download arcore/source-manuscript-id/pdf,
//ui has input to enter new manuscript url
const AtiPublishManuscript: FC<AtiPublishManuscriptProps> = () => {
  return <div>Publish</div>
}

export default AtiPublishManuscript
