import React, { FC, FormEventHandler } from "react"

import axios from "axios"
import { Button, Form, FileUploader, Select, SelectItem, Link } from "carbon-components-react"
import { useRouter } from "next/router"

import { IDataset } from "../../../types/dataverse"

export interface NewAtiProjectFormProps {
  /**List of Dataverse datasets */
  datasets: IDataset[]
  /**Dataverse server URL */
  serverUrl: string
}

/**Form to create a new ATI project */
const NewAtiProjectForm: FC<NewAtiProjectFormProps> = ({ datasets, serverUrl }) => {
  const router = useRouter()
  //const [errorMsg, setErrorMsg] = useState<string>("")
  const onSubmit: FormEventHandler<HTMLFormElement> = async (e) => {
    e.preventDefault()
    const target = e.target as typeof e.target & {
      atiProjectTitle: { value: string }
      atiProjectDesc: { value: string }
      atiProjectSubject: { value: string }
      dataset: { value: string }
      manuscript: { files: FileList }
    }
    const formData = new FormData()
    formData.append("manuscript", target.manuscript.files[0])
    formData.append("dataset", target.dataset.value)

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
  //TODO: is ownerId=1 justified?
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
          <Link
            href={`${serverUrl}/dataset.xhtml?ownerId=1`}
            target="_blank"
            rel="noopener noreferrer"
            size="lg"
          >
            Create dataset
          </Link>
        </div>
        <div className="ar--form-item">
          <Select
            name="dataset"
            helperText="If your dataset is already stored in a Dataverse, choose a dataset to link to your ATI project."
            id="dataverse-dataset"
            labelText="Link to a Dataverse dataset"
            required={true}
            aria-required={true}
          >
            {datasets.map((dataset) => (
              <SelectItem key={dataset.id} text={dataset.title} value={dataset.id} />
            ))}
          </Select>
        </div>
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
        <Button className="ar--form-submit-btn" type="submit">
          Create project
        </Button>
      </Form>
    </div>
  )
}

export default NewAtiProjectForm
