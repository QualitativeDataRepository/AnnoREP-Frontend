import { FC, useEffect, useState, FormEventHandler } from "react"

import axios from "axios"
import { Link, TextInput, Form, Button, InlineNotification, Loading } from "carbon-components-react"

import { IManuscript } from "../../../types/dataverse"
import { getMessageFromError } from "../../../utils/httpRequestUtils"

import layoutStyles from "../../components/Layout/Layout.module.css"

interface AtiExportAnnotationstProps {
  manuscript: IManuscript
  canExportAnnotations: boolean
}

const AtiExportAnnotations: FC<AtiExportAnnotationstProps> = ({
  manuscript,
  canExportAnnotations,
}) => {
  const [downloadStream, setDownloadStream] = useState<string>("")
  const [isLoading, setIsLoading] = useState<boolean>(false)
  const [hasError, setHasError] = useState<boolean>(false)
  const [formMsg, setFormMsg] = useState<string>("")
  useEffect(() => {
    const getFile = async () => {
      /* eslint no-empty: ["error", { "allowEmptyCatch": true }] */
      try {
        const { data } = await axios.get(`/api/arcore/${manuscript.id}/pdf`)
        setDownloadStream(data)
      } catch (e) {}
    }
    if (manuscript.id) {
      getFile()
    }
  }, [manuscript.id])

  const onSumbit: FormEventHandler<HTMLFormElement> = async (e) => {
    e.preventDefault()
    const target = e.target as typeof e.target & {
      destinationUrl: { value: string }
    }

    setIsLoading(true)
    setHasError(false)
    setFormMsg("")
    await axios
      .get(`/api/hypothesis/${manuscript.id}/download-annotations`)
      .then(({ data }) => {
        return axios.post(
          `/api/hypothesis/${manuscript.id}/export-annotations`,
          JSON.stringify({
            destinationUrl: target.destinationUrl.value,
            annotations: data.annotations,
          }),
          {
            headers: {
              "Content-Type": "application/json",
            },
          }
        )
      })
      .then(({ data }) => {
        setIsLoading(false)
        setHasError(false)
        setFormMsg(`${data.message}`)
      })
      .catch((e) => {
        setIsLoading(false)
        setHasError(true)
        setFormMsg(`${getMessageFromError(e)}`)
      })
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
      <div className={layoutStyles.maxwidth}>
        <Form onSubmit={onSumbit}>
          <h2 className="ar--form-title">Export Hypothes.is annotations</h2>
          {downloadStream && (
            <div className="ar--form-desc">
              <Link
                href={`data:application/pdf;base64,${downloadStream}`}
                download={`ingest_manuscript.pdf`}
              >
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
