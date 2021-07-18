import { FC, useEffect, useState } from "react"

import axios from "axios"
import { Link, TextInput, Form, Button } from "carbon-components-react"

import { IManuscript } from "../../../types/dataverse"

interface AtiPublishManuscriptProps {
  manuscript: IManuscript
}
//TODO: get arcore/source-manuscript-id/pdf, so user can upload it to publish destination
//api call to get most recent annoations from hypo, using user hypo api token
//api call to send annotations to new manuscription url, using qdr-user hypo api token
//ui has to link to publish dataset
//ui has download arcore/source-manuscript-id/pdf,
//ui has input to enter new manuscript url
const AtiPublishManuscript: FC<AtiPublishManuscriptProps> = ({ manuscript }) => {
  const [downloadUrl, setDownloadUrl] = useState<string>("")
  useEffect(() => {
    let url = ""
    const getFile = async () => {
      /* eslint no-empty: ["error", { "allowEmptyCatch": true }] */
      try {
        const { data } = await axios.get(`/api/arcore/${manuscript.id}/pdf`)
        const blob = new Blob([data])
        url = URL.createObjectURL(blob)
        setDownloadUrl(url)
      } catch (e) {}
    }
    if (manuscript.id) {
      getFile()
    }

    return () => {
      if (url) {
        URL.revokeObjectURL(url)
      }
    }
  }, [manuscript.id])
  return (
    <>
      <h2>Export Hypothes.is annotations</h2>
      {downloadUrl && (
        <Link href={downloadUrl} download={`IngestPDF ${manuscript.name}`}>
          Download manuscript
        </Link>
      )}
      <div className="ar--form-container">
        <Form>
          <div className="ar--form-item">
            <TextInput
              id="destination-url"
              type="url"
              labelText="Destination URL"
              helperText="Enter the URL of where you want to export the annotations of your manuscript"
              required={true}
              aria-required={true}
              size="xl"
            />
          </div>
          <Button className="ar--form-submit-btn" type="submit">
            Export annotations
          </Button>
        </Form>
      </div>
    </>
  )
}

export default AtiPublishManuscript
