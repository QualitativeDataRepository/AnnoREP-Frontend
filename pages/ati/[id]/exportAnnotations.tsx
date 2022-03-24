import { FC } from "react"

import axios, { AxiosResponse } from "axios"
import { GetServerSideProps } from "next"
import { getSession } from "next-auth/client"

import AtiExportAnnotations from "../../../features/ati/AtiExportAnnotations"
import AtiTab from "../../../features/ati/AtiTab"

import { AtiTab as AtiTabConstant } from "../../../constants/ati"
import {
  ANNOREP_METADATA_VALUE,
  DATAVERSE_HEADER_NAME,
  SOURCE_MANUSCRIPT_TAG,
} from "../../../constants/dataverse"
import { REQUEST_DESC_HEADER_NAME } from "../../../constants/http"
import { IAnnoRepUser } from "../../../types/auth"
import { IATIProjectDetails } from "../../../types/dataverse"
import { IHypothesisGroup } from "../../../types/hypothesis"
import { getAnnoRepUser } from "../../../utils/authUtils"
import { createAtiProjectDetails } from "../../../utils/dataverseUtils"
import { getResponseFromError } from "../../../utils/httpRequestUtils"

interface AtiPageProps {
  user: IAnnoRepUser | null
  appUrl: string
  serverUrl: string
  atiProjectDetails: IATIProjectDetails | null
  hypothesisGroups: IHypothesisGroup[]
}

const AtiPage: FC<AtiPageProps> = ({ user, atiProjectDetails, hypothesisGroups, appUrl }) => {
  return (
    <AtiTab
      user={user}
      dataset={atiProjectDetails ? atiProjectDetails.dataset : null}
      selectedTab={AtiTabConstant.exportAnnotations.id}
    >
      {atiProjectDetails && (
        <AtiExportAnnotations
          appUrl={appUrl}
          datasetId={atiProjectDetails.dataset.id}
          manuscript={atiProjectDetails.manuscript}
          hypothesisGroups={hypothesisGroups}
        />
      )}
    </AtiTab>
  )
}

export default AtiPage

export const getServerSideProps: GetServerSideProps = async (context) => {
  const session = await getSession(context)
  const props: AtiPageProps = {
    user: getAnnoRepUser(session, process.env.DATAVERSE_SERVER_URL),
    atiProjectDetails: null,
    appUrl: process.env.NEXTAUTH_URL as string,
    serverUrl: process.env.DATAVERSE_SERVER_URL as string,
    hypothesisGroups: [],
  }
  const datasetId = context?.params?.id

  const responses: AxiosResponse<any>[] = []

  let ingestPdf = ""

  if (session) {
    const { dataverseApiToken, hypothesisApiToken } = session
    //Get the dataset json
    await axios
      .get(`${process.env.DATAVERSE_SERVER_URL}/api/datasets/${datasetId}`, {
        headers: {
          [DATAVERSE_HEADER_NAME]: dataverseApiToken,
          [REQUEST_DESC_HEADER_NAME]: `Getting JSON for data project ${datasetId}`,
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
        if (manuscript && manuscript.dataFile.id) {
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
      .then((response) => {
        if (response) {
          ingestPdf = Buffer.from(response.data, "binary").toString("base64")
        }
      })
      .catch((e) => {
        const { status, message } = getResponseFromError(e)
        console.error(status, message)
      })
    if (responses.length === 1) {
      props.atiProjectDetails = createAtiProjectDetails(responses[0], "", ingestPdf)
    }

    try {
      const { data } = await axios.get(`${process.env.HYPOTHESIS_SERVER_URL}/api/groups`, {
        headers: {
          Authorization: `Bearer ${hypothesisApiToken}`,
          Accept: "application/json",
          [REQUEST_DESC_HEADER_NAME]: "Getting Hypothes.is groups",
        },
      })
      data.forEach((group: any) => {
        props.hypothesisGroups.push({
          id: group.id,
          name: group.name,
          type: group.type,
        })
      })
    } catch (e) {
      const { status, message } = getResponseFromError(e)
      console.warn(status, message)
    }
  }

  return {
    props: props,
  }
}
