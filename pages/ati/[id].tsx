import { FC } from "react"

import axios from "axios"
import { InlineNotification } from "carbon-components-react"
import { GetServerSideProps } from "next"
import { getSession } from "next-auth/client"

import Layout from "../../features/components/Layout"
import ATIProjectDetails from "../../features/ati/AtiProjectDetails"
import { IATIProjectDetails } from "../../types/dataverse"
import {
  ANNOREP_METADATA_VALUE,
  DATAVERSE_HEADER_NAME,
  SOURCE_MANUSCRIPT_TAG,
  VersionState,
  PublicationStatus,
} from "../../constants/dataverse"

interface AtiProps {
  isLoggedIn: boolean
  serverUrl: string
  canExportAnnotations: boolean
  atiProjectDetails?: IATIProjectDetails
}

const Ati: FC<AtiProps> = ({ isLoggedIn, serverUrl, canExportAnnotations, atiProjectDetails }) => {
  return (
    <Layout
      isLoggedIn={isLoggedIn}
      title={`AnnoREP ${atiProjectDetails ? `- ${atiProjectDetails.dataset.title}` : ""}`}
      isFullWidth={true}
    >
      {atiProjectDetails ? (
        <ATIProjectDetails
          serverUrl={serverUrl}
          atiProjectDetails={atiProjectDetails}
          canExportAnnotations={canExportAnnotations}
        />
      ) : (
        <InlineNotification
          hideCloseButton
          kind="error"
          subtitle={<span>{"You don't have access to this ATI project."}</span>}
          title="Unauthorized!"
        />
      )}
    </Layout>
  )
}

export default Ati

export const getServerSideProps: GetServerSideProps = async (context) => {
  const session = await getSession(context)
  const datasetId = context?.params?.id
  let atiProjectDetails = null
  let canExportAnnotations = false
  if (session && datasetId) {
    /* eslint no-empty: ["error", { "allowEmptyCatch": true }] */
    try {
      const { status, data } = await axios.get(
        `${process.env.DATAVERSE_SERVER_URL}/api/datasets/${datasetId}`,
        {
          headers: {
            [DATAVERSE_HEADER_NAME]: session.dataverseApiToken,
          },
        }
      )
      if (status === 200 && data.status === "OK") {
        const latest = data.data.latestVersion
        const metadataFields = latest.metadataBlocks.citation.fields
        const manuscript = latest.files.find(
          (file: any) =>
            file.directoryLabel === ANNOREP_METADATA_VALUE &&
            file.description === SOURCE_MANUSCRIPT_TAG
        )
        const datasources = latest.files.filter(
          (file: any) => file.categories === undefined || file.categories.includes("Data")
        )
        atiProjectDetails = {
          dataset: {
            id: latest.datasetId,
            doi: latest.datasetPersistentId,
            title: metadataFields.find((field: any) => field.typeName === "title").value,
            version: latest.versionNumber
              ? `${latest.versionNumber}.${latest.versionMinorNumber}`
              : latest.versionState,
            status:
              latest.versionState === VersionState.Released
                ? PublicationStatus.Published
                : PublicationStatus.Unpublished,
          },
          manuscript: {
            id: manuscript?.dataFile.id || "",
            name: manuscript?.dataFile.filename || "",
          },
          datasources: datasources.map((file: any) => {
            return {
              id: `${file.dataFile.id}`,
              name: file.dataFile.filename,
              uri: `${process.env.DATAVERSE_SERVER_URL}/file.xhtml?persistentId?persistentId=${file.dataFile.persistentId}`,
            }
          }),
        }
      }
    } catch (e) {}

    /* eslint no-empty: ["error", { "allowEmptyCatch": true }] */
    try {
      const { data } = await axios({
        method: "GET",
        url: `${process.env.HYPOTHESIS_SERVER_URL}/api/profile`,
        headers: {
          Authorization: `Bearer ${process.env.QDR_HYPOTHESIS_API_TOKEN}`,
        },
      })
      if (data.userid !== null) {
        canExportAnnotations = true
      }
    } catch (error) {}
  }
  return {
    props: {
      isLoggedIn: session ? true : false,
      serverUrl: process.env.DATAVERSE_SERVER_URL,
      atiProjectDetails,
      canExportAnnotations,
    },
  }
}
