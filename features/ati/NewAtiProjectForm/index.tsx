import React, { FC, FormEventHandler, useState } from "react"

import FormData from "form-data"
import axios from "axios"
import {
  Button,
  Form,
  FileUploader,
  Select,
  SelectItem,
  Link,
  InlineNotification,
  InlineLoadingStatus,
} from "carbon-components-react"
import { useRouter } from "next/router"

import { ManuscriptFileExtension, ManuscriptMimeType } from "../../../constants/arcore"
import { IDataset } from "../../../types/dataverse"
import { getMimeType } from "../../../utils/fileUtils"
import { getMessageFromError } from "../../../utils/httpRequestUtils"

export interface NewAtiProjectFormProps {
  /**List of Dataverse datasets */
  datasets: IDataset[]
  /**Dataverse server URL */
  serverUrl: string
}

/**Form to create a new ATI project */
const NewAtiProjectForm: FC<NewAtiProjectFormProps> = ({ datasets, serverUrl }) => {
  const router = useRouter()
  const [taskStatus, setTaskStatus] = useState<InlineLoadingStatus>("inactive")
  const [taskDesc, setTaskDesc] = useState<string>("")
  const onSubmit: FormEventHandler<HTMLFormElement> = async (e) => {
    e.preventDefault()
    const target = e.target as typeof e.target & {
      dataset: { value: string }
      manuscript: { files: FileList }
    }
    if (target.manuscript.files.length === 0) {
      setTaskStatus("error")
      setTaskDesc("Please upload a manuscript file.")
      return
    }
    const firstFourBytes = await target.manuscript.files[0].slice(0, 4).arrayBuffer()
    const firstFourBytesView = new Int8Array(firstFourBytes)
    const mimeType = target.manuscript.files[0].type
      ? target.manuscript.files[0].type
      : getMimeType(firstFourBytesView)
    const acceptedMimeTypes = Object.values(ManuscriptMimeType) as string[]
    if (!acceptedMimeTypes.includes(mimeType)) {
      const msg = target.manuscript.files[0].type
        ? `${target.manuscript.files[0].type} is not a supported file type.`
        : "Unable to determine the file type of the uploaded file."
      setTaskStatus("error")
      setTaskDesc(msg)
      return
    }
    let manuscript = target.manuscript.files[0]
    if (target.manuscript.files[0].type === "") {
      manuscript = new File([manuscript], manuscript.name, { type: mimeType })
    }
    const formData = new FormData()
    formData.append("manuscript", manuscript)
    setTaskStatus("active")
    setTaskDesc("Creating ATI project...")
    await axios({
      method: "PUT",
      url: `/api/datasets/${target.dataset.value}/annorep`,
    })
      .then(() => {
        setTaskDesc("Uploading manuscript...")
        return axios({
          method: "POST",
          url: `/api/datasets/${target.dataset.value}/manuscript`,
          data: formData,
          headers: {
            "Content-Type": "multipart/form-data",
          },
        })
      })
      .then(({ data }) => {
        setTaskDesc("Extracting annotations...")
        const manuscriptId = data.data.files[0].dataFile.id
        return axios({
          method: "PUT",
          url: `/api/arcore/${manuscriptId}`,
        })
      })
      .then(() => {
        setTaskStatus("finished")
        setTaskDesc(`Created ATI project for dataset ${target.dataset.value}.`)
        router.push(`/ati/${target.dataset.value}`)
      })
      .catch((error) => {
        setTaskStatus("error")
        setTaskDesc(`${getMessageFromError(error)}`)
      })
  }
  //TODO: is ownerId=1 justified?
  return (
    <>
      <div className="ar--form-container">
        <Form encType="multipart/form-data" onSubmit={onSubmit}>
          <h1 className="ar--form-title">
            New <abbr>ATI</abbr> Project
          </h1>
          <p className="ar--form-desc">
            Link to a Dataverse dataset and upload a manuscript to create a new <abbr>ATI</abbr>{" "}
            project
          </p>
          <div className="ar--form-item">
            <Link
              href={`${serverUrl}/dataset.xhtml?ownerId=1`}
              target="_blank"
              rel="noopener noreferrer"
              size="lg"
            >
              Create dataset
            </Link>
          </div>
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
            <Select
              name="dataset"
              defaultValue=""
              helperText="If your dataset is already stored in a Dataverse, choose a dataset to link to your ATI project."
              id="dataverse-dataset"
              labelText="Link to a Dataverse dataset"
              required={true}
              aria-required={true}
            >
              <SelectItem
                id="placeholder-item"
                text={datasets.length ? "Choose a dataset" : "Please create a dataset"}
                value=""
              />
              {datasets.map((dataset) => (
                <SelectItem
                  id={dataset.id}
                  key={dataset.id}
                  text={dataset.title}
                  value={dataset.id}
                />
              ))}
            </Select>
          </div>
          <div className="ar--form-item">
            <FileUploader
              aria-required={true}
              accept={[
                ManuscriptFileExtension.docx,
                ManuscriptFileExtension.pdf,
                ManuscriptMimeType.docx,
                ManuscriptMimeType.pdf,
              ]}
              buttonKind="tertiary"
              buttonLabel="Add file"
              filenameStatus="edit"
              iconDescription="Clear file"
              labelDescription="Supported file types are .docx and .pdf."
              labelTitle="Manuscript"
              name="manuscript"
              size="small"
            />
          </div>
          <Button className="ar--form-submit-btn" type="submit">
            Create project
          </Button>
        </Form>
      </div>
    </>
  )
}

export default NewAtiProjectForm
