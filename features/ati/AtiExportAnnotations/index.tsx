import { FC, useState, FormEventHandler, useEffect } from "react"

import axios from "axios"
import {
  Link,
  TextInput,
  Form,
  Button,
  InlineNotification,
  InlineLoadingStatus,
} from "carbon-components-react"

import { IManuscript } from "../../../types/dataverse"
import { getMessageFromError } from "../../../utils/httpRequestUtils"

import styles from "./AtiExportAnnotations.module.css"
import layoutStyles from "../../components/Layout/Layout.module.css"

interface AtiExportAnnotationstProps {
  manuscript: IManuscript
  canExportAnnotations: boolean
}

const AtiExportAnnotations: FC<AtiExportAnnotationstProps> = ({
  manuscript,
  canExportAnnotations,
}) => {
  const [taskStatus, setTaskStatus] = useState<InlineLoadingStatus>("inactive")
  const [taskDesc, setTaskDesc] = useState<string>("")
  const [annotationsJsonStr, setAnnotationsJsonStr] = useState<string>("")

  useEffect(() => {
    const getAnnotationsJson = async () => {
      const { data } = await axios.get(`/api/hypothesis/${manuscript.id}/download-annotations`, {
        headers: {
          Accept: "application/json",
        },
      })
      const jsonStrs = data.annotations.map((annotation: any) => JSON.stringify(annotation))
      const arrayStr = encodeURIComponent(`[${jsonStrs.join(",")}]`)
      setAnnotationsJsonStr(arrayStr)
    }
    if (manuscript.id) {
      getAnnotationsJson()
    }
  }, [manuscript.id])

  const onSumbit: FormEventHandler<HTMLFormElement> = async (e) => {
    e.preventDefault()
    const target = e.target as typeof e.target & {
      destinationUrl: { value: string }
    }

    setTaskStatus("active")
    setTaskDesc("Downloading annotations...")
    await axios
      .get(`/api/hypothesis/${manuscript.id}/download-annotations`)
      .then(({ data }) => {
        setTaskDesc("Exporting annotations...")
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
        setTaskStatus("finished")
        setTaskDesc(`${data.message}`)
      })
      .catch((e) => {
        setTaskStatus("error")
        setTaskDesc(`${getMessageFromError(e)}`)
      })
  }

  if (!canExportAnnotations) {
    return (
      <InlineNotification
        hideCloseButton
        lowContrast
        kind="error"
        subtitle={<span>{"AnnoREP's Hypothes.is API token is invalid."}</span>}
        title="Error!"
      />
    )
  }

  return (
    <>
      <div className={layoutStyles.maxWidth}>
        <Form onSubmit={onSumbit}>
          <h2 className="ar--form-title">Export Hypothes.is annotations</h2>
          {manuscript.ingest && (
            <div className={`${styles.downloadContainer} ar--form-desc`}>
              <Link
                href={`data:application/pdf;base64,${manuscript.ingest}`}
                download={`ingest_manuscript.pdf`}
              >
                Download manuscript
              </Link>
              {manuscript.id && (
                <Link
                  href={`data:application/json;charset=utf-8,${annotationsJsonStr}`}
                  download={`annotations.json`}
                >
                  Download annotations
                </Link>
              )}
            </div>
          )}
          {taskStatus !== "inactive" && (
            <div className="ar--form-item">
              <InlineNotification
                hideCloseButton
                lowContrast
                kind={
                  taskStatus === "active" ? "info" : taskStatus === "finished" ? "success" : "error"
                }
                subtitle={<span>{taskDesc}</span>}
                title={
                  taskStatus === "active"
                    ? "Status"
                    : taskStatus === "finished"
                    ? "Success!"
                    : "Error!"
                }
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
