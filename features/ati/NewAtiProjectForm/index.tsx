import React, { FC, FormEventHandler, useState, ChangeEvent } from "react"

import FormData from "form-data"
import axios from "axios"
import { Add16 } from "@carbon/icons-react"
import {
  Button,
  Form,
  FileUploader,
  Link,
  InlineNotification,
  InlineLoadingStatus,
  ComboBox,
  InlineLoading,
} from "carbon-components-react"
import { useRouter } from "next/router"

import { ManuscriptFileExtension, ManuscriptMimeType } from "../../../constants/arcore"
import { IDatasetOption } from "../../../types/dataverse"
import { getMimeType } from "../../../utils/fileUtils"
import { getMessageFromError } from "../../../utils/httpRequestUtils"
import useSearchDataset from "./useDatasetSearch"
import {
  getErrorMsg,
  getItems,
  getResultDesc,
  getSearchPlaceholder,
  hasMoreDatasets,
} from "./selectors"

import { AtiTab } from "../../../constants/ati"

import styles from "./NewAtiProjectForm.module.css"
import formStyles from "../../../styles/Form.module.css"

export interface NewAtiProjectFormProps {
  /**List of Dataverse datasets */
  datasets: IDatasetOption[]
  /**Dataverse server URL */
  serverUrl: string
  /**The initial number of datasets */
  initialTotalCount: number
  /**The number of datasets per page */
  datasetsPerPage?: number
}

/**Form to create a new ATI project */
const NewAtiProjectForm: FC<NewAtiProjectFormProps> = ({
  datasets,
  serverUrl,
  initialTotalCount,
  datasetsPerPage,
}) => {
  const router = useRouter()
  const [state, dispatch] = useSearchDataset({
    currentTotal: datasets.length,
    totalCount: initialTotalCount,
    datasets: datasets,
    status: "inactive",
    page: 0,
    fetchPage: false,
    perPage: datasetsPerPage || 0,
    q: "",
    fetchQ: false,
    error: "",
  })
  const onShowMore = () => dispatch({ type: "UPDATE_PAGE" })
  /* const onSearch: KeyboardEventHandler<HTMLInputElement> = (e) => {
    const target = e.target as typeof e.target & {
      value: string
    }
    if (e.key === "Enter") {
      dispatch({ type: "UPDATE_Q", payload: target.value.trim() })
    }
  } */
  const [selectedDataset, setSelectedDataset] = useState<{ id: number; label: string } | null>(null)
  const onSelectDataset = (data: any) => {
    setSelectedDataset(data.selectedItem)
  }

  const [selectedManuscript, setSelectedManuscript] = useState<FileList | null>(null)
  const onChangeFileUpload = (e: ChangeEvent<HTMLInputElement>) => {
    setSelectedManuscript(e.target.files)
  }
  const onClearFile = () => {
    setSelectedManuscript(null)
  }

  const [taskStatus, setTaskStatus] = useState<InlineLoadingStatus>("inactive")
  const [taskDesc, setTaskDesc] = useState<string>("")
  const onSubmit: FormEventHandler<HTMLFormElement> = async (e) => {
    e.preventDefault()
    if (selectedManuscript === null || selectedManuscript.length === 0) {
      setTaskStatus("error")
      setTaskDesc("Please upload a manuscript file.")
      return
    }
    const mimeType = await getMimeType(selectedManuscript[0])
    const acceptedMimeTypes = Object.values(ManuscriptMimeType) as string[]
    if (!acceptedMimeTypes.includes(mimeType)) {
      const msg = selectedManuscript[0].type
        ? `${selectedManuscript[0].type} is not a supported file type.`
        : "Unable to determine the file type of the uploaded file."
      setTaskStatus("error")
      setTaskDesc(msg)
      return
    }
    let manuscript = selectedManuscript[0]
    if (selectedManuscript[0].type === "") {
      manuscript = new File([manuscript], manuscript.name, { type: mimeType })
    }
    const formData = new FormData()
    formData.append("manuscript", manuscript)
    setTaskStatus("active")
    setTaskDesc("Creating ATI project...")
    await axios({
      method: "PUT",
      url: `/api/datasets/${selectedDataset?.id}/annorep`,
    })
      .then(() => {
        setTaskDesc(`Uploading ${manuscript.name}...`)
        return axios({
          method: "POST",
          url: `/api/datasets/${selectedDataset?.id}/manuscript`,
          data: formData,
          headers: {
            "Content-Type": "multipart/form-data",
          },
        })
      })
      .then(({ data }) => {
        setTaskDesc(`Extracting annotations from ${manuscript.name}...`)
        const manuscriptId = data.data.files[0].dataFile.id
        return axios({
          method: "PUT",
          url: `/api/arcore/${manuscriptId}`,
          params: {
            datasetId: selectedDataset?.id,
            uploadAnnotations: true,
          },
        })
      })
      .then(() => {
        setTaskStatus("finished")
        setTaskDesc(`Created ATI project for dataset ${selectedDataset?.label}.`)
        router.push(`/ati/${selectedDataset?.id}/${AtiTab.summary.id}`)
      })
      .catch((error) => {
        setTaskStatus("error")
        setTaskDesc(`${getMessageFromError(error)}`)
      })
  }
  //TODO: is ownerId=1 justified?
  return (
    <>
      <div className={formStyles.container}>
        <Form encType="multipart/form-data" onSubmit={onSubmit}>
          <h1 className={formStyles.title}>
            New <abbr>ATI</abbr> Project
          </h1>
          <p className={formStyles.desc}>
            Link to a Dataverse dataset and upload a manuscript to create a new <abbr>ATI</abbr>{" "}
            project
          </p>
          <div className={formStyles.item}>
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
            <div className={formStyles.item}>
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
          <div className={`${formStyles.item} ${styles.searchBox}`}>
            <ComboBox
              id="dataset-search"
              name="dataset"
              required={true}
              aria-required={true}
              items={getItems(state)}
              itemToString={(item) => item?.label || ""}
              placeholder={getSearchPlaceholder(state)}
              titleText={
                <div className={styles.searchTitle}>
                  <div>{"Link to a Dataverse dataset"}</div>
                  <div>
                    {state.status !== "error" && (
                      <InlineLoading
                        className={styles.searchLoader}
                        status={state.status}
                        description={getResultDesc(state)}
                      />
                    )}
                  </div>
                </div>
              }
              helperText="If your dataset is already stored in a Dataverse, choose a dataset to link to your ATI project."
              invalid={state.error !== ""}
              invalidText={getErrorMsg(state)}
              /* onKeyUp={onSearch} */
              onChange={onSelectDataset}
            />
            <div>
              {hasMoreDatasets(state) && (
                <Button
                  className={styles.moreDatasets}
                  kind="tertiary"
                  size="md"
                  onClick={onShowMore}
                >
                  More datasets
                </Button>
              )}
            </div>
          </div>
          <div className={formStyles.item}>
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
              onDelete={onClearFile}
              onChange={onChangeFileUpload}
            />
          </div>
          <Button className={formStyles.submitBtn} type="submit" renderIcon={Add16}>
            Create project
          </Button>
        </Form>
      </div>
    </>
  )
}

export default NewAtiProjectForm
