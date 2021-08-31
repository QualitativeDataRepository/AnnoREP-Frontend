import { FC, useState } from "react"

import {
  UnorderedList,
  ListItem,
  Link,
  Tag,
  Button,
  InlineLoadingStatus,
  InlineNotification,
} from "carbon-components-react"
import { Launch16 } from "@carbon/icons-react"
import { useRouter } from "next/router"

import { PUBLICATION_STATUSES_COLOR } from "../../../constants/dataverse"
import { IATIProjectDetails } from "../../../types/dataverse"

import styles from "./ATISummary.module.css"
import layoutStyles from "../../components/Layout/Layout.module.css"
import atiProjectStyles from "../AtiProject/AtiProject.module.css"
import axios from "axios"
import { getMessageFromError } from "../../../utils/httpRequestUtils"

interface ATISummaryProps {
  serverUrl: string
  atiProjectDetails: IATIProjectDetails
}

const ATISummary: FC<ATISummaryProps> = ({ serverUrl, atiProjectDetails }) => {
  const {
    id,
    doi,
    title,
    description,
    zip,
    subjects,
    publicationStatuses,
    citationHtml,
  } = atiProjectDetails.dataset
  const { manuscript, datasources } = atiProjectDetails

  const router = useRouter()
  const [taskStatus, setTaskStatus] = useState<InlineLoadingStatus>("inactive")
  const [taskDesc, setTaskDesc] = useState<string>("")
  const hasSubmittedForReview = publicationStatuses?.includes("In Review")

  const submitForReview = async () => {
    try {
      setTaskStatus("active")
      setTaskDesc("Submitting project for review...")
      await axios.post(`/api/datasets/${id}/submit-for-review`)
      setTaskStatus("finished")
      setTaskDesc(`Submitted ${title} for review.`)
      router.reload()
    } catch (e) {
      setTaskStatus("error")
      setTaskDesc(getMessageFromError(e))
    }
  }

  return (
    <div className={`${layoutStyles.maxWidth} ${styles.sectionContainer}`}>
      {taskStatus !== "inactive" && (
        <InlineNotification
          hideCloseButton
          lowContrast
          kind={taskStatus === "active" ? "info" : taskStatus === "finished" ? "success" : "error"}
          subtitle={<span>{taskDesc}</span>}
          title={
            taskStatus === "active" ? "Status" : taskStatus === "finished" ? "Success!" : "Error!"
          }
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
      <div aria-label="about" className={styles.aboutContainer}>
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

export default ATISummary
