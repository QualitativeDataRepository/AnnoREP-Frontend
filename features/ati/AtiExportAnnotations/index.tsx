import { FC, useState, FormEventHandler, useEffect } from "react"

import axios from "axios"
import { Export16, TrashCan16 } from "@carbon/icons-react"
import {
  Link,
  TextInput,
  Form,
  Button,
  InlineNotification,
  InlineLoadingStatus,
  Select,
  SelectItem,
  Toggle,
} from "carbon-components-react"

import { AtiTab } from "../../../constants/ati"
import { HYPOTHESIS_PUBLIC_GROUP_ID } from "../../../constants/hypothesis"
import { ALL_HYPOTHESIS_GROUPS_ID } from "./constants"
import DeleteAnnotationsModal from "./DeleteAnnotationsModal"
import useBoolean from "../../../hooks/useBoolean"
import { IManuscript } from "../../../types/dataverse"
import { IHypothesisGroup } from "../../../types/hypothesis"
import { getMessageFromError } from "../../../utils/httpRequestUtils"
import { getTaskNotificationKind, getTaskStatus } from "../../../utils/taskStatusUtils"

import styles from "./AtiExportAnnotations.module.css"
import formStyles from "../../../styles/Form.module.css"
import layoutStyles from "../../components/Layout/Layout.module.css"

export interface AtiExportAnnotationstProps {
  /** The canonical url of the app */
  appUrl: string
  /** The dataset id of the ati project */
  datasetId: string
  /** The manuscript for the ati project */
  manuscript: IManuscript
  /** The list of hypothes.is groups */
  hypothesisGroups: IHypothesisGroup[]
}

const AtiExportAnnotations: FC<AtiExportAnnotationstProps> = ({
  appUrl,
  datasetId,
  manuscript,
  hypothesisGroups,
}) => {
  const [exportTaskStatus, setExportTaskStatus] = useState<InlineLoadingStatus>("inactive")
  const [exportTaskDesc, setExportTaskDesc] = useState<string>("")
  const [deleteTaskStatus, setDeleteTaskStatus] = useState<InlineLoadingStatus>("inactive")
  const [deleteTaskDesc, setDeleteTaskDesc] = useState<string>("")
  const [
    deleteAnnotationsModalIsOpen,
    { setTrue: openDeleteAnnotationsModal, setFalse: closeDeleteAnnotationsModal },
  ] = useBoolean(false)
  const [deleteAnnotationsHypothesisGroup, setDeleteAnnotationsHypothesisGroup] =
    useState<string>("")
  const [annotationsJsonStr, setAnnotationsJsonStr] = useState<string>("")
  useEffect(() => {
    let didCancel = false
    const getAnnotationsJson = async () => {
      const { data } = await axios.get(`/api/hypothesis/${datasetId}/download-annotations`, {
        params: {
          hypothesisGroup: HYPOTHESIS_PUBLIC_GROUP_ID,
          isAdminAuthor: false,
        },
        headers: {
          Accept: "application/json",
        },
      })
      const jsonStrs = data.annotations.map((annotation: any) => JSON.stringify(annotation))
      const arrayStr = encodeURIComponent(`[${jsonStrs.join(",")}]`)
      if (!didCancel) {
        setAnnotationsJsonStr(arrayStr)
      }
    }
    if (manuscript.id) {
      getAnnotationsJson()
    }

    return () => {
      didCancel = true
    }
  }, [manuscript.id, datasetId])

  const onExportAnnotations: FormEventHandler<HTMLFormElement> = async (e) => {
    e.preventDefault()
    const target = e.target as typeof e.target & {
      destinationUrl: { value: string }
      destinationHypothesisGroup: { value: string }
      sourceHypothesisGroup: { value: string }
      privateAnnotation: { checked: boolean }
    }

    setExportTaskStatus("active")
    setExportTaskDesc("Downloading annotations...")
    await axios
      .get(`/api/hypothesis/${datasetId}/download-annotations`, {
        params: {
          hypothesisGroup:
            target.sourceHypothesisGroup.value === ALL_HYPOTHESIS_GROUPS_ID
              ? ""
              : target.sourceHypothesisGroup.value,
          isAdminAuthor: false,
        },
      })
      .then(({ data }) => {
        setExportTaskDesc("Exporting annotations...")
        return axios.post(
          `/api/hypothesis/${datasetId}/export-annotations`,
          JSON.stringify({
            isAdminAuthor: false,
            destinationUrl: target.destinationUrl.value,
            annotations: data.annotations,
            destinationHypothesisGroup: target.destinationHypothesisGroup.value,
            privateAnnotation: target.privateAnnotation.checked,
          }),
          {
            headers: {
              "Content-Type": "application/json",
            },
          }
        )
      })
      .then(({ data }) => {
        setExportTaskStatus("finished")
        setExportTaskDesc(
          `Exported ${data.totalExported} annotation(s) from ${manuscript.name} to ${target.destinationUrl.value}.`
        )
      })
      .catch((e) => {
        setExportTaskStatus("error")
        setExportTaskDesc(`${getMessageFromError(e)}`)
      })
  }

  const onDeleteAnnotations: FormEventHandler<HTMLFormElement> = async (e) => {
    e.preventDefault()
    const target = e.target as typeof e.target & {
      sourceHypothesisGroup: { value: string }
    }
    setDeleteAnnotationsHypothesisGroup(
      target.sourceHypothesisGroup.value === ALL_HYPOTHESIS_GROUPS_ID
        ? ""
        : target.sourceHypothesisGroup.value
    )
    openDeleteAnnotationsModal()
  }

  const handleDeleteAnnotations = async () => {
    closeDeleteAnnotationsModal()
    setDeleteTaskStatus("active")
    setDeleteTaskDesc("Downloading annotations...")
    await axios
      .get(`/api/hypothesis/${datasetId}/download-annotations`, {
        params: {
          hypothesisGroup: deleteAnnotationsHypothesisGroup,
          isAdminAuthor: false,
        },
      })
      .then(({ data }) => {
        setDeleteTaskDesc(`Deleting ${data.annotations.length} annotation(s)...`)
        return axios.delete(`/api/hypothesis/${datasetId}/delete-annotations`, {
          data: JSON.stringify({ annotations: data.annotations }),
          params: {
            isAdminAuthor: false,
          },
          headers: {
            "Content-Type": "application/json",
          },
        })
      })
      .then(({ data }) => {
        setDeleteTaskStatus("finished")
        setDeleteTaskDesc(`Deleted ${data.totalDeleted} annotation(s) from ${manuscript.name}.`)
      })
      .catch((e) => {
        setDeleteTaskStatus("error")
        setDeleteTaskDesc(`${getMessageFromError(e)}`)
      })
  }

  return (
    <>
      <div className={`${layoutStyles.maxWidth} ${styles.formContainer}`}>
        <Form onSubmit={onExportAnnotations}>
          <h2 className={formStyles.title}>Export Hypothes.is annotations</h2>
          {manuscript.ingest && (
            <div className={`${styles.downloadContainer} ${formStyles.desc}`}>
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
          {exportTaskStatus !== "inactive" && (
            <div className={formStyles.item}>
              <InlineNotification
                hideCloseButton
                lowContrast
                kind={getTaskNotificationKind(exportTaskStatus)}
                subtitle={<span>{exportTaskDesc}</span>}
                title={getTaskStatus(exportTaskStatus)}
              />
            </div>
          )}
          <div className={formStyles.item}>
            <TextInput
              readOnly
              aria-readonly
              id="export-annotations-source-url"
              name="sourceUrl"
              value={`${appUrl}/ati/${datasetId}/${AtiTab.manuscript.id}`}
              type="url"
              labelText="Source URL"
              size="xl"
            />
          </div>
          <div className={formStyles.item}>
            <Select
              required
              aria-required
              helperText="Choose the Hypothes.is group from which to export annotations"
              id="export-annotations-source-hypothesis-group"
              name="sourceHypothesisGroup"
              labelText="Source Hypothes.is group"
              defaultValue={HYPOTHESIS_PUBLIC_GROUP_ID}
            >
              <SelectItem
                key={ALL_HYPOTHESIS_GROUPS_ID}
                text={"All groups"}
                value={ALL_HYPOTHESIS_GROUPS_ID}
              />
              {hypothesisGroups.map((group) => (
                <SelectItem
                  key={group.id}
                  text={`${group.name} (${group.type})`}
                  value={group.id}
                />
              ))}
            </Select>
          </div>
          <div className={formStyles.item}>
            <TextInput
              id="destination-url"
              name="destinationUrl"
              type="url"
              labelText="Destination URL"
              helperText="Enter the URL of where you want to export the annotations"
              required={true}
              aria-required={true}
              size="xl"
            />
          </div>
          <div className={formStyles.item}>
            <Select
              required
              aria-required
              helperText="Choose the Hypothes.is group of the exported annotations"
              id="destinaton-hypothesis-group"
              name="destinationHypothesisGroup"
              labelText="Destination Hypothes.is group"
            >
              {hypothesisGroups.map((group) => (
                <SelectItem
                  key={group.id}
                  text={`${group.name} (${group.type})`}
                  value={group.id}
                />
              ))}
            </Select>
          </div>
          <div className={formStyles.item}>
            <Toggle
              id="toggle-annotation-visibility"
              labelA="No"
              labelB="Yes"
              labelText="Post annotations to only me"
              name="privateAnnotation"
            />
          </div>
          <Button
            className={formStyles.submitBtn}
            type="submit"
            renderIcon={Export16}
            disabled={exportTaskStatus === "active"}
          >
            Export annotations
          </Button>
        </Form>
        <Form onSubmit={onDeleteAnnotations} className={styles.deleteForm}>
          <h2>Delete Hypothes.is annotations</h2>
          <p className={formStyles.desc}>
            Note: You must have the required permissions to delete annotations.
          </p>
          {deleteTaskStatus !== "inactive" && (
            <div className={formStyles.item}>
              <InlineNotification
                hideCloseButton
                lowContrast
                kind={getTaskNotificationKind(deleteTaskStatus)}
                subtitle={<span>{deleteTaskDesc}</span>}
                title={getTaskStatus(deleteTaskStatus)}
              />
            </div>
          )}
          <div className={formStyles.item}>
            <TextInput
              readOnly
              aria-readonly
              id="delete-annotations-source-url"
              name="sourceUrl"
              value={`${appUrl}/ati/${datasetId}/${AtiTab.manuscript.id}`}
              type="url"
              labelText="Source URL"
              size="xl"
            />
          </div>
          <div className={formStyles.item}>
            <Select
              required
              aria-required
              helperText="Choose the Hypothes.is group from which to delete annotations"
              id="delete-annotations-source-hypothesis-group"
              name="sourceHypothesisGroup"
              labelText="Source Hypothes.is group"
              defaultValue={HYPOTHESIS_PUBLIC_GROUP_ID}
            >
              <SelectItem
                key={ALL_HYPOTHESIS_GROUPS_ID}
                text={"All groups"}
                value={ALL_HYPOTHESIS_GROUPS_ID}
              />
              {hypothesisGroups.map((group) => (
                <SelectItem
                  key={group.id}
                  text={`${group.name} (${group.type})`}
                  value={group.id}
                />
              ))}
            </Select>
          </div>
          <Button
            kind="danger"
            className={formStyles.submitBtn}
            type="submit"
            renderIcon={TrashCan16}
            disabled={deleteTaskStatus === "active"}
          >
            Delete annotations
          </Button>
        </Form>
        <DeleteAnnotationsModal
          manuscriptName={manuscript.name}
          open={deleteAnnotationsModalIsOpen}
          closeModal={closeDeleteAnnotationsModal}
          handleDeleteAnnotations={handleDeleteAnnotations}
        />
      </div>
    </>
  )
}

export default AtiExportAnnotations
