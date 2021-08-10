import { FC } from "react"

import axios from "axios"
import { InlineNotification } from "carbon-components-react"
import { getSession } from "next-auth/client"
import { GetServerSideProps } from "next"
import qs from "qs"

import NewAtiProjectForm from "../../features/ati/NewAtiProjectForm"
import Layout from "../../features/components/Layout"

import { IDataset } from "../../types/dataverse"
import { ANNOREP_METADATA_VALUE, KIND_OF_DATA_NAME } from "../../constants/dataverse"

interface NewAtiProps {
  isLoggedIn: boolean
  datasets: IDataset[]
  serverUrl: string
}

const NewAti: FC<NewAtiProps> = ({ isLoggedIn, datasets, serverUrl }) => {
  return (
    <Layout isLoggedIn={isLoggedIn} title="AnnoREP - New ATI Project">
      {isLoggedIn ? (
        <NewAtiProjectForm datasets={datasets} serverUrl={serverUrl} />
      ) : (
        <InlineNotification
          hideCloseButton
          lowContrast
          kind="info"
          subtitle={<span>{"Please login to create a new ATI project."}</span>}
          title="Unauthorized!"
        />
      )}
    </Layout>
  )
}

export default NewAti

export const getServerSideProps: GetServerSideProps = async (context) => {
  const session = await getSession(context)
  const datasets: IDataset[] = []
  if (session) {
    const { status, data } = await axios.get(
      //TODO: change to X-Dataverse-key header later
      `${process.env.DATAVERSE_SERVER_URL}/api/mydata/retrieve`,
      {
        params: {
          key: session.dataverseApiToken,
          dvobject_types: "Dataset",
          published_states: ["Published", "Unpublished", "Draft", "In Review"],
          mydata_search_term: `-${KIND_OF_DATA_NAME}:${ANNOREP_METADATA_VALUE}`,
          //role_ids: [5, 6, 7, 26, 27],
        },
        paramsSerializer: (params) => {
          return qs.stringify(params, { indices: false })
        },
      }
    )
    if (status === 200 && data.success) {
      const items = data.data.items
      const datasetDict: Record<string, any> = {}
      for (let i = 0; i < items.length; i++) {
        const id = items[i].entity_id
        if (datasetDict[id]) {
          const foundDataset = datasetDict[id]
          if (items[i].is_draft_state) {
            datasetDict[id] = items[i]
          } else {
            const foundVersion = `${foundDataset.majorVersion}.${foundDataset.minorVersion}`
            const version = `${items[i].majorVersion}.${items[i].minorVersion}`
            if (!foundDataset.is_draft_state && foundVersion < version) {
              datasetDict[id] = items[i]
            }
          }
        } else {
          datasetDict[id] = items[i]
        }
      }
      const filteredDatasets = Object.values(datasetDict)
      for (let i = 0; i < filteredDatasets.length; i++) {
        datasets.push({
          id: filteredDatasets[i].entity_id,
          doi: filteredDatasets[i].global_id,
          title: filteredDatasets[i].name,
        })
      }
    }
  }
  return {
    props: {
      isLoggedIn: session ? true : false,
      serverUrl: process.env.DATAVERSE_SERVER_URL,
      datasets,
    },
  }
}
