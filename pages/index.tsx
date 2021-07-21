import { FC } from "react"

import axios from "axios"
import { GetServerSideProps } from "next"
import { getSession } from "next-auth/client"
import qs from "qs"

import { Add16 } from "@carbon/icons-react"
import { Link } from "carbon-components-react"

import AtiProject from "../features/ati/AtiProject"
import Layout from "../features/components/Layout"

import { IAtiProject } from "../types/ati"

import { ANNOREP_METADATA_VALUE, KIND_OF_DATA_NAME } from "../constants/dataverse"

import styles from "../styles/Home.module.css"

interface HomeProps {
  isLoggedIn: boolean
  atiProjects: IAtiProject[]
}
const Home: FC<HomeProps> = ({ isLoggedIn, atiProjects }) => {
  return (
    <Layout isLoggedIn={isLoggedIn} title="AnnoREP">
      <div>
        {isLoggedIn ? (
          <div>
            <div className={styles.titlecontainer}>
              <h1>ATI Projects</h1>
              <Link href="/new" renderIcon={Add16}>
                New ATI Project
              </Link>
            </div>
            {atiProjects.map(({ id, title, version, status }) => (
              <AtiProject key={id} id={id} title={title} version={version} status={status} />
            ))}
            {atiProjects.length === 0 && <div>No current ATI projects</div>}
          </div>
        ) : (
          <div className={styles.callout}>
            <h1>AnnoREP</h1>
            <p>
              AnnoREP is an open-source, web-based tool that will help facilitate{" "}
              <a href={"https://qdr.syr.edu/ati"}>Annotation for Transprent Inquiry (ATI)</a> and
              other annotation-based workflows.
            </p>
            <div>
              <Link href="/new" renderIcon={Add16} size="lg">
                New ATI Project
              </Link>
            </div>
          </div>
        )}
      </div>
    </Layout>
  )
}

export default Home

export const getServerSideProps: GetServerSideProps = async (context) => {
  const session = await getSession(context)
  const atiProjects: IAtiProject[] = []
  if (session) {
    const { status, data } = await axios.get(
      //TODO: change to X-Dataverse-key header later
      `${process.env.DATAVERSE_SERVER_URL}/api/mydata/retrieve`,
      {
        params: {
          key: session.dataverseApiToken,
          dvobject_types: "Dataset",
          published_states: ["Published", "Unpublished", "Draft", "In Review"],
          mydata_search_term: `${KIND_OF_DATA_NAME}:${ANNOREP_METADATA_VALUE}`,
          //role_ids: [5, 6, 7, 26, 27],
        },
        paramsSerializer: (params) => {
          return qs.stringify(params, { indices: false })
        },
      }
    )
    if (status === 200 && data.success) {
      const items = data.data.items
      const datasetDict: Record<string, any> = {}
      for (let i = 0; i < items.length; i++) {
        const id = items[i].entity_id
        if (datasetDict[id]) {
          const foundDataset = datasetDict[id]
          if (items[i].is_draft_state) {
            datasetDict[id] = items[i]
          } else {
            const foundVersion = `${foundDataset.majorVersion}.${foundDataset.minorVersion}`
            const version = `${items[i].majorVersion}.${items[i].minorVersion}`
            if (!foundDataset.is_draft_state && foundVersion < version) {
              datasetDict[id] = items[i]
            }
          }
        } else {
          datasetDict[id] = items[i]
        }
      }
      const filteredDatasets = Object.values(datasetDict)
      for (let i = 0; i < filteredDatasets.length; i++) {
        atiProjects.push({
          id: filteredDatasets[i].entity_id,
          title: filteredDatasets[i].name,
          status: filteredDatasets[i].publication_statuses.join(", "),
          version: filteredDatasets[i].majorVersion
            ? `${filteredDatasets[i].majorVersion}.${filteredDatasets[i].minorVersion}`
            : filteredDatasets[i].versionState,
        })
      }
    }
  }
  return {
    props: { isLoggedIn: session ? true : false, atiProjects },
  }
}
