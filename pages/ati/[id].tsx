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
import { REQUEST_DESC_HEADER_NAME, SKIP_RESPONSE } from "../../constants/http"
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
          lowContrast
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
    try {
      //Is the qdr hypothesis api token valid?
      const { data } = await axios.get(`${process.env.HYPOTHESIS_SERVER_URL}/api/profile`, {
        headers: {
          Authorization: `Bearer ${process.env.QDR_HYPOTHESIS_API_TOKEN}`,
        },
      })
      if (data.userid !== null) {
        //The qdr hypothesis api token is valid
        canExportAnnotations = true
      }
    } catch (e) {
      const { status, message } = getResponseFromError(e)
      console.error(status, message)
    }
    //Get the dataset json
    await axios
      .get(`${process.env.DATAVERSE_SERVER_URL}/api/datasets/${datasetId}`, {
        headers: {
          [DATAVERSE_HEADER_NAME]: dataverseApiToken,
          [REQUEST_DESC_HEADER_NAME]: `Getting JSON for dataset ${datasetId}`,
          Accept: "application/json",
        },
      })
      .then((datasetJsonResponse) => {
        //Add dataset json
        responses.push(datasetJsonResponse)

        const latest = datasetJsonResponse.data.data.latestVersion
        const manuscript = latest.files.find(
          (file: any) =>
            file.directoryLabel === ANNOREP_METADATA_VALUE &&
            file.description === SOURCE_MANUSCRIPT_TAG
        )
        const promises: Promise<AxiosResponse<any> | any>[] = []
        if (manuscript && manuscript.dataFile.id) {
          //Get the ingest pdf
          promises.push(
            axios.get(
              `${process.env.ARCORE_SERVER_URL}/api/documents/${manuscript.dataFile.id}/pdf`,
              {
                responseType: "arraybuffer",
                headers: {
                  [DATAVERSE_HEADER_NAME]: dataverseApiToken,
                  Accept: "application/pdf",
                },
              }
            )
          )
        } else {
          promises.push(Promise.resolve(SKIP_RESPONSE))
        }

        if (latest.files.length > 0) {
          //Get the dataset zip
          promises.push(
            axios.get(`${process.env.DATAVERSE_SERVER_URL}/api/access/dataset/${datasetId}`, {
              responseType: "arraybuffer",
              headers: {
                [DATAVERSE_HEADER_NAME]: dataverseApiToken,
                [REQUEST_DESC_HEADER_NAME]: `Getting the zip for dataset ${datasetId}`,
                Accept: "application/zip",
              },
            })
          )
        } else {
          promises.push(Promise.resolve(SKIP_RESPONSE))
        }

        return Promise.all(promises)
      })
      .then((responses) => {
        if (responses[0] !== SKIP_RESPONSE) {
          ingestPdf = Buffer.from(responses[0].data, "binary").toString("base64")
        }
        if (responses[1] !== SKIP_RESPONSE) {
          datasetZip = Buffer.from(responses[1].data, "binary").toString("base64")
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
