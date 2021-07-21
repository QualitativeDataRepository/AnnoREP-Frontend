import { FC, useEffect, useState, FormEventHandler } from "react"

import axios from "axios"
import { Link, TextInput, Form, Button, InlineNotification, Loading } from "carbon-components-react"

import { IManuscript } from "../../../types/dataverse"
import { getMessageFromError } from "../../../utils/httpRequestUtils"

interface AtiExportAnnotationstProps {
  manuscript: IManuscript
  canExportAnnotations: boolean
}
//TODO: get arcore/source-manuscript-id/pdf, so user can upload it to publish destination
//api call to get most recent annoations from hypo, using user hypo api token
//api call to send annotations to new manuscription url, using qdr-user hypo api token
//ui has to link to publish dataset
//ui has download arcore/source-manuscript-id/pdf,
//ui has input to enter new manuscript url
const AtiExportAnnotations: FC<AtiExportAnnotationstProps> = ({
  manuscript,
  canExportAnnotations,
}) => {
  const [downloadUrl, setDownloadUrl] = useState<string>("")
  const [isLoading, setIsLoading] = useState<boolean>(false)
  const [hasError, setHasError] = useState<boolean>(false)
  const [formMsg, setFormMsg] = useState<string>("")
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

  const onSumbit: FormEventHandler<HTMLFormElement> = async (e) => {
    e.preventDefault()
    const target = e.target as typeof e.target & {
      destinationUrl: { value: string }
    }
    try {
      setIsLoading(true)
      setFormMsg("")
      const { data } = await axios.post(
        `/api/export-annotations/${manuscript.id}`,
        JSON.stringify({
          destinationUrl: target.destinationUrl.value,
        }),
        {
          headers: {
            "Content-Type": "application/json",
          },
        }
      )
      setHasError(false)
      setFormMsg(`${data.message}`)
    } catch (e) {
      setIsLoading(false)
      setHasError(true)
      setFormMsg(`${getMessageFromError(e)}`)
    }
  }

  if (!canExportAnnotations) {
    return (
      <InlineNotification
        hideCloseButton
        kind="error"
        subtitle={<span>{"AnnoRep's Hypothes.is API token is invalid."}</span>}
        title="Error"
      />
    )
  }

  return (
    <>
      {isLoading && <Loading description="Export annotations" />}
      <div className="ar--form-container">
        <Form onSubmit={onSumbit}>
          <h2 className="ar--form-title">Export Hypothes.is annotations</h2>
          {downloadUrl && (
            <div className="ar--form-desc">
              <Link href={downloadUrl} download={`IngestPDF ${manuscript.name}`}>
                Download manuscript
              </Link>
            </div>
          )}
          {formMsg && (
            <div className="ar--form-item">
              <InlineNotification
                hideCloseButton
                kind={hasError ? "error" : "success"}
                subtitle={<span>{formMsg}</span>}
                title={hasError ? "Error" : "Success"}
              />
            </div>
          )}
          <div className="ar--form-item">
            <TextInput
              id="destination-url"
              name="destinationUrl"
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

export default AtiExportAnnotations
