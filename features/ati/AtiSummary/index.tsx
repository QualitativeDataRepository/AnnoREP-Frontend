import { FC, useState, useEffect } from "react"

import axios from "axios"
import { UnorderedList, ListItem, Link } from "carbon-components-react"

import { IATIProjectDetails } from "../../../types/dataverse"

import styles from "./ATISummary.module.css"
import layoutStyles from "../../components/Layout/Layout.module.css"

interface ATISummaryProps {
  serverUrl: string
  atiProjectDetails: IATIProjectDetails
}

const ATISummary: FC<ATISummaryProps> = ({ serverUrl, atiProjectDetails }) => {
  const { id, doi, title, status, version } = atiProjectDetails.dataset
  const { manuscript, datasources } = atiProjectDetails
  const [downloadUrl, setDownloadUrl] = useState<string>("")
  useEffect(() => {
    let url = ""
    const getFile = async () => {
      /* eslint no-empty: ["error", { "allowEmptyCatch": true }] */
      try {
        const { data } = await axios.get(`/api/datasets/${id}`)
        const arrayBuffer = new ArrayBuffer(data.file.data.length)
        const view = new Uint8Array(arrayBuffer)
        for (let i = 0; i < data.file.data.length; i++) {
          view[i] = data.file.data[i]
        }
        const blob = new Blob([arrayBuffer])
        url = URL.createObjectURL(blob)
        setDownloadUrl(url)
      } catch (e) {}
    }
    if (id) {
      getFile()
    }

    return () => {
      if (url) {
        URL.revokeObjectURL(url)
      }
    }
  }, [id])

  return (
    <div className={layoutStyles.maxwidth}>
      <section aria-label="about" className={styles.section}>
        <h2 className={styles.header}>About</h2>
        <p>
          Project title:{" "}
          <Link
            href={`${serverUrl}/dataset.xhtml?persistentId=${doi}`}
            target="_blank"
            rel="noopener noreferrer"
            size="lg"
          >
            {title}
          </Link>
        </p>
        <span className="ar--secondary-text">{`Version ${version} • ${status}`}</span>
        {downloadUrl && (
          <div>
            <Link href={downloadUrl} download={`${title} files.zip`} size="lg">
              Download project bundle
            </Link>
          </div>
        )}
      </section>
      <section aria-label="manuscript" className={styles.section}>
        <h2 className={styles.header}>Manuscript</h2>
        <p>{manuscript.name}</p>
      </section>
      <section aria-label="datasources" className={styles.section}>
        <h2 className={styles.header}>Datasources</h2>
        <div className={styles.listcontainer}>
          <UnorderedList>
            {datasources.map(({ id, name }) => (
              <ListItem key={id}>{name}</ListItem>
            ))}
          </UnorderedList>
        </div>
      </section>
    </div>
  )
}

export default ATISummary
