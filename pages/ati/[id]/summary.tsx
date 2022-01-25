import { FC } from "react"

import axios, { AxiosResponse } from "axios"
import { GetServerSideProps } from "next"
import { getSession } from "next-auth/client"
import qs from "qs"

import AtiSummary from "../../../features/ati/AtiSummary"
import AtiTab from "../../../features/ati/AtiTab"

import {
  DATASET_DV_TYPE,
  DATAVERSE_HEADER_NAME,
  PUBLICATION_STATUSES,
} from "../../../constants/dataverse"
import { REQUEST_DESC_HEADER_NAME } from "../../../constants/http"
import { AtiTab as AtiTabConstant } from "../../../constants/ati"
import { IATIProjectDetails } from "../../../types/dataverse"
import { createAtiProjectDetails } from "../../../utils/dataverseUtils"
import { getResponseFromError } from "../../../utils/httpRequestUtils"

interface AtiPageProps {
  isLoggedIn: boolean
  serverUrl: string
  atiProjectDetails: IATIProjectDetails | null
  appUrl: string
  hypthesisAtiStagingGroupId: string
}

const AtiPage: FC<AtiPageProps> = ({
  isLoggedIn,
  serverUrl,
  atiProjectDetails,
  appUrl,
  hypthesisAtiStagingGroupId,
}) => {
  return (
    <AtiTab
      isLoggedIn={isLoggedIn}
      dataset={atiProjectDetails ? atiProjectDetails.dataset : null}
      selectedTab={AtiTabConstant.summary.id}
    >
      {atiProjectDetails && (
        <AtiSummary
          serverUrl={serverUrl}
          atiProjectDetails={atiProjectDetails}
          appUrl={appUrl}
          hypothesisAtiStagingGroupId={hypthesisAtiStagingGroupId}
        />
      )}
    </AtiTab>
  )
}

export default AtiPage

export const getServerSideProps: GetServerSideProps = async (context) => {
  const props: AtiPageProps = {
    isLoggedIn: false,
    atiProjectDetails: null,
    serverUrl: process.env.DATAVERSE_SERVER_URL as string,
    appUrl: process.env.NEXTAUTH_URL as string,
    hypthesisAtiStagingGroupId: process.env.HYPOTHESIS_ATI_STAGING_GROUP_ID as string,
  }
  const session = await getSession(context)
  const datasetId = context?.params?.id

  const responses: AxiosResponse<any>[] = []
  let datasetZip = ""
  let citationHtml = ""
  let publicationStatuses: string[] = []

  if (session) {
    props.isLoggedIn = true
    const { dataverseApiToken } = session
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
        responses.push(datasetJsonResponse)
        const dsPersistentId = datasetJsonResponse.data.data.latestVersion.datasetPersistentId
        const promises = [
          axios.get(`${process.env.DATAVERSE_SERVER_URL}/api/mydata/retrieve`, {
            params: {
              key: dataverseApiToken,
              dvobject_types: DATASET_DV_TYPE,
              published_states: PUBLICATION_STATUSES,
              mydata_search_term: `"${dsPersistentId}"`,
            },
            paramsSerializer: (params) => {
              return qs.stringify(params, { indices: false })
            },
            headers: {
              [REQUEST_DESC_HEADER_NAME]: `Searching for dataset ${dsPersistentId}`,
            },
          }),
        ]
        const latest = datasetJsonResponse.data.data.latestVersion
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
        }
        return Promise.all(promises)
      })
      .then((extraResponses) => {
        if (extraResponses[0].data.success && extraResponses[0].data.data.items.length > 0) {
          const dataset = extraResponses[0].data.data.items[0]
          citationHtml = dataset.citationHtml
          publicationStatuses = dataset.publication_statuses
        }
        if (extraResponses.length == 2) {
          datasetZip = Buffer.from(extraResponses[1].data, "binary").toString("base64")
        }
      })
      .catch((e) => {
        const { status, message } = getResponseFromError(e)
        console.error(status, message)
      })
    if (responses.length === 1) {
      props.atiProjectDetails = createAtiProjectDetails(responses[0], datasetZip, "")
      if (citationHtml) {
        props.atiProjectDetails.dataset.citationHtml = citationHtml
      }
      if (publicationStatuses) {
        props.atiProjectDetails.dataset.publicationStatuses = publicationStatuses
      }
    }
  }

  return {
    props: props,
  }
}
