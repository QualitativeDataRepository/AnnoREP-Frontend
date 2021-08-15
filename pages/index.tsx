import { FC } from "react"

import axios from "axios"
import { GetServerSideProps } from "next"
import Link from "next/link"
import { getSession } from "next-auth/client"

import { Add16 } from "@carbon/icons-react"
import { InlineNotification, Button } from "carbon-components-react"

import AtiProjects from "../features/ati/AtiProjects"
import Layout from "../features/components/Layout"

import { IAtiProject } from "../types/ati"

import {
  ANNOREP_METADATA_VALUE,
  DATAVERSE_HEADER_NAME,
  KIND_OF_DATA_NAME,
  NUMBER_OF_ATI_PROJECTS_PER_PAGE,
  PublicationStatus,
  VersionState,
} from "../constants/dataverse"

import styles from "../styles/Home.module.css"

interface HomeProps {
  isLoggedIn: boolean
  atiProjects: IAtiProject[]
  totalCount: number
}
const Home: FC<HomeProps> = ({ isLoggedIn, atiProjects, totalCount }) => {
  return (
    <Layout isLoggedIn={isLoggedIn} title="AnnoREP">
      <>
        {isLoggedIn ? (
          <div className={styles.loggedInContainer}>
            <h1>ATI Projects</h1>
            {totalCount === 0 ? (
              <InlineNotification
                hideCloseButton
                lowContrast
                kind="info"
                subtitle={<span>No ATI projects found.</span>}
                title="Status"
              />
            ) : (
              <AtiProjects atiProjects={atiProjects} initialTotalCount={totalCount} />
            )}
          </div>
        ) : (
          <div className={styles.callout}>
            <h1>About</h1>
            <p>
              AnnoREP is an open-source, web-based tool that will help facilitate{" "}
              <a href={"https://qdr.syr.edu/ati"}>Annotation for Transprent Inquiry (ATI)</a> and
              other annotation-based workflows.
            </p>
            <div>
              <Link href="/new">
                <Button as="a" href="/new" kind="primary" size="sm" renderIcon={Add16}>
                  New ATI Project
                </Button>
              </Link>
            </div>
          </div>
        )}
      </>
    </Layout>
  )
}

export default Home

export const getServerSideProps: GetServerSideProps = async (context) => {
  const session = await getSession(context)
  const atiProjects: IAtiProject[] = []
  let totalCount = 0
  if (session) {
    const { status, data } = await axios.get(`${process.env.DATAVERSE_SERVER_URL}/api/search`, {
      params: {
        q: `${KIND_OF_DATA_NAME}:${ANNOREP_METADATA_VALUE}`,
        type: "dataset",
        sort: "date",
        order: "desc",
        per_page: NUMBER_OF_ATI_PROJECTS_PER_PAGE,
        show_entity_ids: true,
      },
      headers: {
        [DATAVERSE_HEADER_NAME]: session.dataverseApiToken,
      },
    })
    if (status === 200 && data.data.total_count > 0) {
      totalCount = data.data.total_count
      const items = data.data.items
      for (let i = 0; i < items.length; i++) {
        atiProjects.push({
          id: items[i].entity_id,
          title: items[i].name,
          description: items[i].description,
          status:
            items[i].versionState === VersionState.Released
              ? PublicationStatus.Published
              : PublicationStatus.Unpublished,
          version: items[i].majorVersion
            ? `${items[i].majorVersion}.${items[i].minorVersion}`
            : items[i].versionState,
        })
      }
    }
  }
  return {
    props: { isLoggedIn: session ? true : false, atiProjects, totalCount },
  }
}
