import React, { FC, FormEventHandler, useState } from "react"

import axios from "axios"
import {
  Button,
  Form,
  TextArea,
  TextInput,
  FileUploader,
  Select,
  SelectItem,
  Toggle,
} from "carbon-components-react"
import { useRouter } from "next/router"

import { IDataset } from "../../../types/dataverse"

export interface NewAtiProjectFormProps {
  /**List of Dataverse datasets */
  datasets: IDataset[]
}

/**Form to create a new ATI project */
const NewAtiProjectForm: FC<NewAtiProjectFormProps> = ({ datasets }) => {
  const router = useRouter()
  // eslint-disable-next-line no-unused-vars, @typescript-eslint/no-unused-vars
  const [datasetsState, setDatasets] = useState<IDataset[]>(datasets || [])
  const [newDataset, setNewDataset] = useState<boolean>(datasets.length === 0)
  const onNewDatasetToggle = () => {
    setNewDataset((prev) => !prev)
  }
  //const [errorMsg, setErrorMsg] = useState<string>("")
  const onSubmit: FormEventHandler<HTMLFormElement> = async (e) => {
    e.preventDefault()
    const target = e.target as typeof e.target & {
      atiProjectTitle: { value: string }
      atiProjectDesc: { value: string }
      atiProjectSubject: { value: string }
      dataset: { value: string }
      manuscript: { files: FileList }
      datasources: { files: FileList }
    }
    const formData = new FormData()
    formData.append("newDataset", newDataset ? "on" : "off")
    formData.append("manuscript", target.manuscript.files[0])
    for (let i = 0; i < target.datasources.files.length; i++) {
      formData.append("datasources[]", target.datasources.files[i])
    }
    if (newDataset) {
      formData.append("atiProjectTitle", target.atiProjectTitle.value)
      formData.append("atiProjectDesc", target.atiProjectDesc.value)
      formData.append("atiProjectSubject", target.atiProjectSubject.value)
    } else {
      formData.append("dataset", target.dataset.value)
    }
    const { status, data } = await axios({
      method: "POST",
      url: "/api/ati",
      data: formData,
      headers: {
        "Content-Type": "multipart/form-data",
      },
    })
    //console.log("api post", status, data)
    if (status === 201) {
      router.push(`/ati/${data.atiId}`)
    } else {
      //setErrorMsg(data.errorMsg)
      //error msg for each input?
      //if datasetId is new, added to datasets
    }
    //get back response
    //success, status 201 get ati id, redirect to ati/id
    //failure, show message
    //401 unathorized
    //400 general error show message
  }
  return (
    <div className="ar--form-container">
      <Form encType="multipart/form-data" onSubmit={onSubmit}>
        <h1 className="ar--form-title">
          New <abbr>ATI</abbr> Project
        </h1>
        <p className="ar--form-desc">
          Upload files from your device to create a new <abbr>ATI</abbr> project.
        </p>
        <div className="ar--form-item">
          <Toggle
            aria-label="Create new dataset"
            id="new-dataset-toggle"
            labelText="Create new dataset"
            disabled={datasets.length === 0}
            toggled={newDataset}
            onToggle={onNewDatasetToggle}
          />
        </div>
        {newDataset ? (
          <>
            <div className="ar--form-item">
              <TextInput
                id="ati-project-title"
                name="atiProjectTitle"
                labelText="Project Title"
                placeholder="Enter your project title"
                required={true}
                aria-required={true}
                size="xl"
                type="text"
              />
            </div>
            <div className="ar--form-item">
              <TextArea
                id="ati-project-desc"
                name="atiProjectDesc"
                labelText="Project Description"
                placeholder="Enter your project description"
                required={true}
                aria-required={true}
                rows={4}
              />
            </div>
            <div className="ar--form-item">
              <TextInput
                id="ati-project-subject"
                name="atiProjectSubject"
                labelText="Project Subject"
                placeholder="Enter your project subject"
                required={true}
                aria-required={true}
                size="xl"
                type="text"
              />
            </div>
          </>
        ) : (
          <div className="ar--form-item">
            <Select
              name="dataset"
              helperText="If your dataset is already stored in a Dataverse, choose a dataset to link to your ATI project."
              id="dataverse-dataset"
              labelText="Link to a Dataverse dataset"
              required={true}
              aria-required={true}
            >
              {datasetsState.map((dataset) => (
                <SelectItem key={dataset.id} text={dataset.title} value={dataset.id} />
              ))}
            </Select>
          </div>
        )}
        <div className="ar--form-item">
          <FileUploader
            aria-required={true}
            accept={[".docx, .pdf"]}
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
        <div className="ar--form-item">
          <FileUploader
            accept={[".docx, .pdf"]}
            buttonKind="tertiary"
            buttonLabel="Add file(s)"
            filenameStatus="edit"
            iconDescription="Clear file"
            labelDescription="Supported file types are .docx and .pdf."
            labelTitle="Datasources"
            multiple={true}
            name="datasources"
            size="small"
          />
        </div>
        <Button className="ar--form-submit-btn" type="submit">
          Create project
        </Button>
      </Form>
    </div>
  )
}

export default NewAtiProjectForm
