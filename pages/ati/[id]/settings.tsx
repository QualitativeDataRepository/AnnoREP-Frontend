import { FC } from "react"

import axios, { AxiosResponse } from "axios"
import { GetServerSideProps } from "next"
import { getSession } from "next-auth/client"

import AtiSettings from "../../../features/ati/AtiSettings"
import AtiTab from "../../../features/ati/AtiTab"

import { AtiTab as AtiTabConstant } from "../../../constants/ati"
import { DATAVERSE_HEADER_NAME } from "../../../constants/dataverse"
import { REQUEST_DESC_HEADER_NAME } from "../../../constants/http"
import { IAnnoRepUser } from "../../../types/auth"
import { IATIProjectDetails } from "../../../types/dataverse"
import { getAnnoRepUser } from "../../../utils/authUtils"
import { createAtiProjectDetails } from "../../../utils/dataverseUtils"
import { getResponseFromError } from "../../../utils/httpRequestUtils"

interface AtiPageProps {
  user: IAnnoRepUser | null
  serverUrl: string
  atiProjectDetails: IATIProjectDetails | null
}

const AtiPage: FC<AtiPageProps> = ({ user, atiProjectDetails }) => {
  return (
    <AtiTab
      user={user}
      dataset={atiProjectDetails ? atiProjectDetails.dataset : null}
      selectedTab={AtiTabConstant.settings.id}
    >
      {atiProjectDetails && (
        <AtiSettings
          dataset={atiProjectDetails.dataset}
          manuscript={atiProjectDetails.manuscript}
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
    serverUrl: process.env.DATAVERSE_SERVER_URL as string,
  }
  const datasetId = context?.params?.id

  const responses: AxiosResponse<any>[] = []

  if (session) {
    const { dataverseApiToken } = session
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
      })
      .catch((e) => {
        const { status, message } = getResponseFromError(e)
        console.error(status, message)
      })
    if (responses.length === 1) {
      props.atiProjectDetails = createAtiProjectDetails(responses[0], "", "")
    }
  }

  return {
    props: props,
  }
}
