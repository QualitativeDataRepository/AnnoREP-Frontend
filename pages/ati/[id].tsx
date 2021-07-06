import { FC } from "react"

import axios from "axios"
import { GetServerSideProps } from "next"
import { getSession } from "next-auth/client"

import Layout from "../../features/components/Layout"
import ATIProjectDetails from "../../features/ati/AtiProjectDetails"
import { IATIProjectDetails } from "../../types/dataverse"
import { DATAVERSE_HEADER_NAME } from "../../constants/dataverse"

interface AtiProps {
  atiProjectDetails?: IATIProjectDetails
}

const Ati: FC<AtiProps> = ({ atiProjectDetails }) => {
  return (
    <Layout
      title={`AnnoREP - ${atiProjectDetails ? atiProjectDetails.dataset.title : ""}`}
      isFullWidth={true}
    >
      {atiProjectDetails ? (
        <ATIProjectDetails atiProjectDetails={atiProjectDetails} />
      ) : (
        "You don't have access to this ATI."
      )}
    </Layout>
  )
}

export default Ati

export const getServerSideProps: GetServerSideProps = async (context) => {
  const session = await getSession(context)
  //create the callbacks to update ati, using id
  const datasetId = context?.params?.id
  let atiProjectDetails
  if (session && datasetId) {
    const { status, data } = await axios.get(`${session.serverUrl}/api/datasets/${datasetId}`, {
      headers: {
        [DATAVERSE_HEADER_NAME]: session.apiToken,
      },
    })
    if (status === 200 && data.status === "OK") {
      const latest = data.data.latestVersion
      const metadataFields = latest.metadataBlocks.citation.fields
      atiProjectDetails = {
        dataset: {
          id: latest.datasetId,
          doi: latest.datasetPersistentId,
          title: metadataFields.find((field: any) => field.typeName === "title").value, //TODO: multiple titles
          version: latest.versionState,
          status: "test",
        },
        //TODO: find the file with CLEAN MANUSCRIPT TAG
        manuscript: {
          id: "manuscript",
          name: "manuscript",
        },
        //TODO: only consider data files, no manifest?
        datasources: latest.files.map((file: any) => {
          return {
            id: `${file.dataFile.id}`,
            name: file.dataFile.filename,
            uri: `${session.serverUrl}/file.xhtml?fileId=${file.dataFile.id}`,
          }
        }),
      }
    }
  }
  return {
    props: {
      atiProjectDetails,
    },
  }
}
