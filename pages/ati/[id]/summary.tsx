import { FC } from "react"

import axios, { AxiosResponse } from "axios"
import { GetServerSideProps } from "next"
import { getSession } from "next-auth/client"

import AtiSummary from "../../../features/ati/AtiSummary"
import AtiTab from "../../../features/ati/AtiTab"

import { DATAVERSE_HEADER_NAME } from "../../../constants/dataverse"
import { REQUEST_DESC_HEADER_NAME } from "../../../constants/http"
import { AtiTab as AtiTabConstant } from "../../../constants/ati"
import { IATIProjectDetails } from "../../../types/dataverse"

import { createAtiProjectDetails } from "../../../utils/dataverseUtils"
import { getResponseFromError } from "../../../utils/httpRequestUtils"

interface AtiPageProps {
  isLoggedIn: boolean
  serverUrl: string
  atiProjectDetails: IATIProjectDetails | null
}

const AtiPage: FC<AtiPageProps> = ({ isLoggedIn, serverUrl, atiProjectDetails }) => {
  return (
    <AtiTab
      isLoggedIn={isLoggedIn}
      dataset={atiProjectDetails ? atiProjectDetails.dataset : null}
      selectedTab={AtiTabConstant.summary.id}
    >
      {atiProjectDetails && (
        <AtiSummary serverUrl={serverUrl} atiProjectDetails={atiProjectDetails} />
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
  }
  const session = await getSession(context)
  const datasetId = context?.params?.id

  const responses: AxiosResponse<any>[] = []
  let datasetZip = ""

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
        //Add dataset json
        responses.push(datasetJsonResponse)
        const latest = datasetJsonResponse.data.data.latestVersion
        if (latest.files.length > 0) {
          //Get the dataset zip
          return axios.get(`${process.env.DATAVERSE_SERVER_URL}/api/access/dataset/${datasetId}`, {
            responseType: "arraybuffer",
            headers: {
              [DATAVERSE_HEADER_NAME]: dataverseApiToken,
              [REQUEST_DESC_HEADER_NAME]: `Getting the zip for dataset ${datasetId}`,
              Accept: "application/zip",
            },
          })
        }
      })
      .then((response) => {
        if (response) {
          datasetZip = Buffer.from(response.data, "binary").toString("base64")
        }
      })
      .catch((e) => {
        const { status, message } = getResponseFromError(e)
        console.error(status, message)
      })
    if (responses.length === 1) {
      props.atiProjectDetails = createAtiProjectDetails(responses[0], datasetZip, "")
    }
  }

  return {
    props: props,
  }
}
