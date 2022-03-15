import React, {
  FC,
  FormEventHandler,
  useState,
  ChangeEvent,
  useCallback,
  useMemo,
  useEffect,
} from "react"

import FormData from "form-data"
import axios from "axios"
import { Add16, OverflowMenuVertical24 } from "@carbon/icons-react"
import {
  Button,
  Form,
  FileUploader,
  InlineNotification,
  ComboBox,
  InlineLoading,
  OrderedList,
  ListItem,
} from "carbon-components-react"
import { debounce } from "lodash"
import { useRouter } from "next/router"

import { ManuscriptFileExtension, ManuscriptMimeType } from "../../../constants/arcore"
import { AtiTab } from "../../../constants/ati"
import { getErrorMsg, getItems, getResultDesc, hasMoreDatasets } from "./selectors"
import { SearchDatasetActionType } from "./state"
import useSearchDataset from "./useDatasetSearch"
import useTask, {
  TaskActionType,
  getTaskNotificationKind,
  getTaskStatus,
} from "../../../hooks/useTask"
import { IDatasetOption } from "../../../types/dataverse"
import { getMimeType } from "../../../utils/fileUtils"
import { getMessageFromError } from "../../../utils/httpRequestUtils"

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
  const onShowMore = () => dispatch({ type: SearchDatasetActionType.UPDATE_PAGE })
  const onRefreshDataProjects = () =>
    dispatch({ type: SearchDatasetActionType.UPDATE_Q, payload: "" })

  const debounceSearch = useMemo(
    () =>
      debounce(
        (inputValue: string) =>
          dispatch({ type: SearchDatasetActionType.UPDATE_Q, payload: inputValue }),
        200
      ),
    [dispatch]
  )
  useEffect(() => {
    // Cancel the searching on unmount
    return debounceSearch.cancel()
  }, [debounceSearch])
  const handleSearch: FormEventHandler<HTMLInputElement> = (e) => {
    const target = e.target as typeof e.target & {
      value: string
    }
    debounceSearch(target.value.trim())
  }
  const memoizedHandleSearch = useCallback(handleSearch, [debounceSearch])

  const [selectedDataset, setSelectedDataset] = useState<{ id: string; label: string } | null>(null)
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

  const { state: taskState, dispatch: taskDispatch } = useTask({ status: "inactive", desc: "" })
  const onSubmit: FormEventHandler<HTMLFormElement> = async (e) => {
    e.preventDefault()
    if (selectedManuscript === null || selectedManuscript.length === 0) {
      taskDispatch({ type: TaskActionType.FAIL, payload: "Please upload a manuscript file." })
      return
    }
    const mimeType = await getMimeType(selectedManuscript[0])
    const acceptedMimeTypes = Object.values(ManuscriptMimeType) as string[]
    if (!acceptedMimeTypes.includes(mimeType)) {
      const msg = selectedManuscript[0].type
        ? `${selectedManuscript[0].type} is not a supported file type.`
        : "Unable to determine the file type of the uploaded file."
      taskDispatch({ type: TaskActionType.FAIL, payload: msg })
      return
    }
    let manuscript = selectedManuscript[0]
    if (selectedManuscript[0].type === "") {
      manuscript = new File([manuscript], manuscript.name, { type: mimeType })
    }
    const formData = new FormData()
    formData.append("manuscript", manuscript)
    taskDispatch({ type: TaskActionType.START, payload: "Creating ATI project..." })
    await axios({
      method: "PUT",
      url: `/api/datasets/${selectedDataset?.id}/annorep`,
    })
      .then(() => {
        taskDispatch({ type: TaskActionType.NEXT_STEP, payload: `Uploading ${manuscript.name}...` })
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
        taskDispatch({
          type: TaskActionType.NEXT_STEP,
          payload: `Extracting annotations from ${manuscript.name}...`,
        })
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
        taskDispatch({
          type: TaskActionType.FINISH,
          payload: `Created ATI project for data project ${selectedDataset?.label}.`,
        })
        router.push(`/ati/${selectedDataset?.id}/${AtiTab.manuscript.id}`)
      })
      .catch((error) => {
        taskDispatch({ type: TaskActionType.FAIL, payload: getMessageFromError(error) })
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
            An <abbr>ATI</abbr> project has two components:
            <OrderedList native isExpressive>
              <ListItem>
                A <abbr>QDR</abbr> data project that holds all metadata as well as any data files
              </ListItem>
              <ListItem>A manuscript to annotate</ListItem>
            </OrderedList>
          </p>
          {taskState.status !== "inactive" && (
            <div className={formStyles.item}>
              <InlineNotification
                hideCloseButton
                lowContrast
                kind={getTaskNotificationKind(taskState)}
                subtitle={<span>{taskState.desc}</span>}
                title={getTaskStatus(taskState)}
              />
            </div>
          )}
          <fieldset>
            <legend className="bx--file--label">
              1. <abbr>QDR</abbr> data project
            </legend>

            <div className={`${formStyles.item} ${styles.searchBox}`}>
              <ComboBox
                id="dataset-search"
                name="dataset"
                required={true}
                aria-required={true}
                items={getItems(state)}
                itemToString={(item) => item?.label || ""}
                placeholder="Please choose a data project"
                titleText={
                  <div className={styles.searchTitle}>
                    <div>
                      Link to a <abbr>QDR</abbr> data project
                    </div>
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
                helperText={
                  <span>
                    If your data project is already stored on <abbr>QDR</abbr>, choose a data
                    project to link to your <abbr>ATI</abbr> project.
                  </span>
                }
                invalid={state.error !== ""}
                invalidText={getErrorMsg(state)}
                onInput={memoizedHandleSearch}
                onChange={onSelectDataset}
              />
              {hasMoreDatasets(state) && (
                <Button
                  hasIconOnly
                  kind="tertiary"
                  size="md"
                  iconDescription="More data projects"
                  tooltipPosition="bottom"
                  tooltipAlignment="end"
                  onClick={onShowMore}
                >
                  <OverflowMenuVertical24 />
                </Button>
              )}
            </div>
            <div className={formStyles.item}>
              <p className="bx--label">
                Don&apos;t have a <abbr>QDR</abbr> data project?
              </p>
              <div>
                <Button
                  kind="ghost"
                  size="sm"
                  as="a"
                  href={`${serverUrl}/dataset.xhtml?ownerId=1`}
                  target="_blank"
                  rel="noopener noreferrer"
                >
                  Create new
                </Button>
                <Button kind="ghost" size="sm" onClick={onRefreshDataProjects}>
                  Refresh data projects
                </Button>
              </div>
            </div>
          </fieldset>
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
              labelTitle="2. Manuscript"
              name="manuscript"
              size="small"
              onDelete={onClearFile}
              onChange={onChangeFileUpload}
            />
          </div>
          <Button className={formStyles.submitBtn} type="submit" renderIcon={Add16}>
            <span>
              Create <abbr>ATI</abbr> project
            </span>
          </Button>
        </Form>
      </div>
    </>
  )
}

export default NewAtiProjectForm
