import { FC } from "react"
import {
  UnorderedList,
  ListItem,
  Link,
  Tag,
  Button,
  InlineNotification,
} from "carbon-components-react"
import { Launch16 } from "@carbon/icons-react"
import { useRouter } from "next/router"

import { axiosClient } from "../../app"

import { AtiTab } from "../../../constants/ati"
import { PUBLICATION_STATUSES_COLOR } from "../../../constants/dataverse"
import { HYPOTHESIS_PUBLIC_GROUP_ID } from "../../../constants/hypothesis"
import useTask, {
  TaskActionType,
  getTaskNotificationKind,
  getTaskStatus,
} from "../../../hooks/useTask"
import { IATIProjectDetails } from "../../../types/dataverse"
import { getMessageFromError } from "../../../utils/httpRequestUtils"

import styles from "./AtiSummary.module.css"
import layoutStyles from "../../components/Layout/Layout.module.css"
import atiProjectStyles from "../AtiProject/AtiProject.module.css"

export interface AtiSummaryProps {
  /** The canonical url of the app */
  appUrl: string
  /** The hypothesis groupd id of ATI_Staging */
  hypothesisAtiStagingGroupId: string
  /** The dataverse server url where the dataset for the ati project is deposited */
  serverUrl: string
  /** The ati project details */
  atiProjectDetails: IATIProjectDetails
}

const AtiSummary: FC<AtiSummaryProps> = ({
  serverUrl,
  atiProjectDetails,
  appUrl,
  hypothesisAtiStagingGroupId,
}) => {
  const { id, doi, title, description, zip, subjects, publicationStatuses, citationHtml } =
    atiProjectDetails.dataset
  const { manuscript, datasources } = atiProjectDetails

  const router = useRouter()
  const { state: taskState, dispatch: taskDispatch } = useTask({ status: "inactive", desc: "" })
  const hasSubmittedForReview = publicationStatuses?.includes("In Review")

  const submitForReview = async () => {
    try {
      taskDispatch({ type: TaskActionType.START, payload: "Submitting project for review..." })

      const submitForReviewPromise = axiosClient.post(`/api/datasets/${id}/submit-for-review`)

      const getAtiStagingAnnotationsPromise = axiosClient.get(
        `/api/hypothesis/${id}/download-annotations`,
        {
          params: { hypothesisGroup: hypothesisAtiStagingGroupId, isAdminAuthor: true },
        }
      )
      const getUserAnnotationsPromise = axiosClient.get(
        `/api/hypothesis/${id}/download-annotations`,
        {
          params: { hypothesisGroup: HYPOTHESIS_PUBLIC_GROUP_ID, isAdminAuthor: false },
        }
      )
      const [getAtiStagingAnnotationsResult, getUserAnnotationsResult] = await Promise.all([
        getAtiStagingAnnotationsPromise,
        getUserAnnotationsPromise,
      ])

      const deleteAtiStagingAnnotationsPromise = axiosClient.delete(
        `/api/hypothesis/${id}/delete-annotations`,
        {
          data: JSON.stringify({ annotations: getAtiStagingAnnotationsResult.data.annotations }),
          params: {
            isAdminAuthor: true,
          },
          headers: {
            "Content-Type": "application/json",
          },
        }
      )
      const exportUserAnnotationsPromise = axiosClient.post(
        `/api/hypothesis/${id}/export-annotations`,
        JSON.stringify({
          isAdminAuthor: true,
          destinationUrl: `${appUrl}/ati/${id}/${AtiTab.manuscript.id}`,
          annotations: getUserAnnotationsResult.data.annotations,
          destinationHypothesisGroup: hypothesisAtiStagingGroupId,
          privateAnnotation: false,
        }),
        {
          headers: {
            "Content-Type": "application/json",
          },
        }
      )
      await Promise.all([
        submitForReviewPromise,
        deleteAtiStagingAnnotationsPromise,
        exportUserAnnotationsPromise,
      ])
      taskDispatch({ type: TaskActionType.FINISH, payload: `Submitted ${title} for review.` })
      router.reload()
    } catch (e) {
      taskDispatch({ type: TaskActionType.FAIL, payload: getMessageFromError(e) })
    }
  }

  return (
    <div className={`${layoutStyles.maxWidth} ${styles.sectionContainer}`}>
      {taskState.status !== "inactive" && (
        <InlineNotification
          hideCloseButton
          lowContrast
          kind={getTaskNotificationKind(taskState)}
          subtitle={<span>{taskState.desc}</span>}
          title={getTaskStatus(taskState)}
        />
      )}
      <div>
        <h2>
          <Link
            href={`${serverUrl}/dataset.xhtml?persistentId=${doi}`}
            target="_blank"
            rel="noopener noreferrer"
            size="lg"
            renderIcon={Launch16}
          >
            {title}
          </Link>
        </h2>
        <div>
          {publicationStatuses?.sort().map((status, i) => (
            <Tag key={i} id={status} type={PUBLICATION_STATUSES_COLOR[status]} size="sm">
              {status}
            </Tag>
          ))}
        </div>
      </div>
      <div className={styles.aboutContainer}>
        <div className={styles.buttonSet}>
          {zip && (
            <Button
              kind="primary"
              href={`data:application/zip;base64,${zip}`}
              download={`dataverse_files.zip`}
              size="sm"
            >
              Download project
            </Button>
          )}
          <Button
            kind="primary"
            size="sm"
            disabled={hasSubmittedForReview}
            onClick={submitForReview}
          >
            {hasSubmittedForReview ? "Submitted for review" : "Submit for review"}
          </Button>
        </div>
        <div className={styles.about}>
          {citationHtml && (
            <p className={atiProjectStyles.citation}>
              <span dangerouslySetInnerHTML={{ __html: citationHtml }} />{" "}
            </p>
          )}
          <dl className={styles.descriptionList}>
            <div>
              <dt>Description</dt>
              <dd>{description}</dd>
            </div>
            <div>
              <dt>Subject</dt>
              <dd>
                <UnorderedList>
                  {subjects?.map((subject) => (
                    <ListItem key={subject}>{subject}</ListItem>
                  ))}
                </UnorderedList>
              </dd>
            </div>
            <div>
              <dt>Manuscript</dt>
              <dd>{manuscript.name || "No manuscript found"}</dd>
            </div>
            <div>
              <dt>Datasource(s)</dt>
              <dd>
                {datasources.length === 0 ? (
                  <span>No datasource(s) found</span>
                ) : (
                  <UnorderedList>
                    {datasources.map(({ id, name }) => (
                      <ListItem key={id}>{name}</ListItem>
                    ))}
                  </UnorderedList>
                )}
              </dd>
            </div>
          </dl>
        </div>
      </div>
    </div>
  )
}

export default AtiSummary
