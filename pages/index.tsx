import { FC } from "react"

import axios from "axios"
import { GetServerSideProps } from "next"
import Link from "next/link"
import { getSession } from "next-auth/client"
import qs from "qs"

import { Add16 } from "@carbon/icons-react"
import { InlineNotification, Button } from "carbon-components-react"

import AtiProjects from "../features/ati/AtiProjects"
import Layout from "../features/components/Layout"

import { REQUEST_DESC_HEADER_NAME } from "../constants/http"
import { IAtiProject } from "../types/ati"
import { getResponseFromError } from "../utils/httpRequestUtils"

import {
  ANNOREP_METADATA_VALUE,
  DATASET_DV_TYPE,
  KIND_OF_DATA_NAME,
  PUBLICATION_STATUSES,
} from "../constants/dataverse"

import styles from "../styles/Home.module.css"

interface HomeProps {
  isLoggedIn: boolean
  atiProjects: IAtiProject[]
  totalCount: number
  atisPerPage?: number
  publicationStatusCount?: any
  selectedFilters?: any
  errorMsg?: string
}
const Home: FC<HomeProps> = ({
  isLoggedIn,
  atiProjects,
  totalCount,
  errorMsg,
  atisPerPage,
  publicationStatusCount,
  selectedFilters,
}) => {
  return (
    <Layout isLoggedIn={isLoggedIn} title="AnnoREP">
      <>
        {isLoggedIn ? (
          <div className={styles.loggedInContainer}>
            <div className={styles.titleContainer}>
              <h1>ATI Projects</h1>
              <Link href="/new">
                <Button as="a" href="/new" kind="primary" size="md" renderIcon={Add16}>
                  New ATI Project
                </Button>
              </Link>
            </div>
            {totalCount === 0 || errorMsg ? (
              <InlineNotification
                hideCloseButton
                lowContrast
                kind={errorMsg ? "error" : "info"}
                subtitle={<span>{errorMsg ? errorMsg : "No ATI projects found."}</span>}
                title={errorMsg ? "Error!" : "Status"}
              />
            ) : (
              <AtiProjects
                atiProjects={atiProjects}
                initialTotalCount={totalCount}
                atisPerPage={atisPerPage as number}
                publicationStatusCount={publicationStatusCount}
                selectedFilters={selectedFilters}
              />
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
  const props: HomeProps = {
    isLoggedIn: false,
    atiProjects: [],
    totalCount: 0,
  }
  if (session) {
    props.isLoggedIn = true
    try {
      const { data } = await axios.get(`${process.env.DATAVERSE_SERVER_URL}/api/mydata/retrieve`, {
        params: {
          key: session.dataverseApiToken,
          dvobject_types: DATASET_DV_TYPE,
          published_states: PUBLICATION_STATUSES,
          mydata_search_term: `${KIND_OF_DATA_NAME}:${ANNOREP_METADATA_VALUE}`,
        },
        paramsSerializer: (params) => {
          return qs.stringify(params, { indices: false })
        },
        headers: {
          [REQUEST_DESC_HEADER_NAME]: `Searching for ${ANNOREP_METADATA_VALUE} datasets`,
        },
      })
      if (data.success) {
        const items = data.data.items
        for (let i = 0; i < items.length; i++) {
          props.atiProjects.push({
            id: items[i].entity_id,
            name: items[i].name,
            description: items[i].description,
            citationHtml: items[i].citationHtml,
            dataverseName: items[i].name_of_dataverse,
            publicationStatuses: items[i].publication_statuses,
            dateDisplay: items[i].date_to_display_on_card,
            userRoles: items[i].user_roles,
            dataverseServerUrl: process.env.DATAVERSE_SERVER_URL as string,
            dataverse: items[i].identifier_of_dataverse,
          })
        }
        props.totalCount = data.data.total_count
        props.atisPerPage = data.data.pagination.docsPerPage
        props.publicationStatusCount = data.data.pubstatus_counts
        props.selectedFilters = data.data.selected_filters
      }
    } catch (e) {
      const { message } = getResponseFromError(e)
      props.errorMsg = message
    }
  }
  return {
    props: props,
  }
}
