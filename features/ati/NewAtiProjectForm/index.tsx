import React, { FC } from "react"

import { Button, Form, TextInput, FileUploader, Select, SelectItem } from "carbon-components-react"
import "carbon-components/css/carbon-components.min.css"

export interface Dataset {
  id: string
  title: string
}

export interface NewAtiProjectFormProps {
  /**List of Dataverse datasets */
  datasets?: Dataset[]
}

/**Form to create a new ATI project */
const NewAtiProjectForm: FC<NewAtiProjectFormProps> = ({ datasets }) => {
  return (
    <div className="ar--form-container">
      <Form action="/api/ati" method="post">
        <h1 className="ar--form-title">
          New <abbr>ATI</abbr> Project
        </h1>
        <p className="ar--form-desc">
          Upload files from your device to create a new <abbr>ATI</abbr> project.
        </p>
        <div className="ar--form-item">
          <TextInput
            id="ati-project-title"
            labelText="Project Title"
            placeholder="Enter your project title"
            required={true}
            aria-required={true}
            size="xl"
            type="text"
          />
        </div>
        {datasets && datasets.length > 0 && (
          <div className="ar--form-item">
            <Select
              defaultValue="placeholder-item"
              helperText="If your dataset is already stored in a Dataverse, choose a dataset to link to your ATI project."
              id="dataverse-dataset"
              labelText="Link to a Dataverse dataset"
            >
              <SelectItem text="Choose a dataset" value="placeholder-item" disabled />
              {datasets.map((dataset) => (
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
