import { FC } from "react"

import axios, { AxiosResponse } from "axios"
import { InlineNotification } from "carbon-components-react"
import { GetServerSideProps } from "next"
import { getSession } from "next-auth/client"

import Layout from "../../features/components/Layout"
import ATIProjectDetails from "../../features/ati/AtiProjectDetails"

import { AtiTab, IAtiTab, tabs } from "../../constants/ati"
import {
  ANNOREP_METADATA_VALUE,
  DATAVERSE_HEADER_NAME,
  SOURCE_MANUSCRIPT_TAG,
} from "../../constants/dataverse"
import { REQUEST_DESC_HEADER_NAME } from "../../constants/http"
import { IATIProjectDetails } from "../../types/dataverse"
import { createAtiProjectDetails } from "../../utils/dataverseUtils"
import { getResponseFromError } from "../../utils/httpRequestUtils"

interface AtiProps {
  isLoggedIn: boolean
  serverUrl: string
  canExportAnnotations: boolean
  atiTab: IAtiTab
  atiProjectDetails?: IATIProjectDetails
}

const Ati: FC<AtiProps> = ({
  isLoggedIn,
  serverUrl,
  canExportAnnotations,
  atiProjectDetails,
  atiTab,
}) => {
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
          atiTab={atiTab}
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
  let canExportAnnotations = false
  const responses: AxiosResponse<any>[] = []
  let datasetZip = ""
  let ingestPdf = ""
  if (session && datasetId) {
    const { dataverseApiToken } = session
    await Promise.all([
      //Get the dataset json
      axios.get(`${process.env.DATAVERSE_SERVER_URL}/api/datasets/${datasetId}`, {
        headers: {
          [DATAVERSE_HEADER_NAME]: dataverseApiToken,
          [REQUEST_DESC_HEADER_NAME]: `Getting JSON for dataset ${datasetId}`,
          Accept: "application/json",
        },
      }),
      //Get the dataset zip
      axios.get(`${process.env.DATAVERSE_SERVER_URL}/api/access/dataset/${datasetId}`, {
        responseType: "arraybuffer",
        headers: {
          [DATAVERSE_HEADER_NAME]: dataverseApiToken,
          [REQUEST_DESC_HEADER_NAME]: `Getting the zip for dataset ${datasetId}`,
          Accept: "application/zip",
        },
      }),
      //Is the qdr hypothesis api token valid?
      axios.get(`${process.env.HYPOTHESIS_SERVER_URL}/api/profile`, {
        headers: {
          Authorization: `Bearer ${process.env.QDR_HYPOTHESIS_API_TOKEN}`,
        },
      }),
    ])
      .then((axiosResponses) => {
        //Add dataset json
        responses.push(axiosResponses[0])
        //Get the dataset zip
        datasetZip = Buffer.from(axiosResponses[1].data, "binary").toString("base64")
        if (axiosResponses[2].data.userid !== null) {
          //The qdr hypothesis api token is valid
          canExportAnnotations = true
        }
        const latest = axiosResponses[0].data.data.latestVersion
        const manuscript = latest.files.find(
          (file: any) =>
            file.directoryLabel === ANNOREP_METADATA_VALUE &&
            file.description === SOURCE_MANUSCRIPT_TAG
        )
        if (manuscript.dataFile.id) {
          //Get the ingest pdf
          return axios.get(
            `${process.env.ARCORE_SERVER_URL}/api/documents/${manuscript.dataFile.id}/pdf`,
            {
              responseType: "arraybuffer",
              headers: {
                [DATAVERSE_HEADER_NAME]: dataverseApiToken,
                Accept: "application/pdf",
              },
            }
          )
        }
      })
      .then((ingestPdfResponse) => {
        if (ingestPdfResponse) {
          ingestPdf = Buffer.from(ingestPdfResponse.data, "binary").toString("base64")
        }
      })
      .catch((e) => {
        const { status, message } = getResponseFromError(e)
        console.error(status, message)
      })
  }

  return {
    props: {
      isLoggedIn: session ? true : false,
      serverUrl: process.env.DATAVERSE_SERVER_URL,
      atiProjectDetails:
        responses.length === 1
          ? createAtiProjectDetails(responses[0], datasetZip, ingestPdf)
          : null,
      canExportAnnotations,
      atiTab:
        tabs.findIndex((tab) => tab === context.query.atiTab) > -1
          ? context.query.atiTab
          : AtiTab.summary.id,
    },
  }
}
