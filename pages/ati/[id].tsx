import { FC } from "react"

import { GetServerSideProps } from "next"
import { getSession } from "next-auth/client"

import Layout from "../../features/components/Layout"
import ATIProjectDetails from "../../features/ati/AtiProjectDetails"
import { IATIProjectDetails } from "../../types/dataverse"

interface AtiProps {
  hasAccess: boolean
  atiProjectDetails: IATIProjectDetails
}

const Ati: FC<AtiProps> = ({ hasAccess, atiProjectDetails }) => {
  //create callbacks for everything regarding updating ati, or delete
  //populate into various tab
  return (
    <Layout title={`AnnoREP - ${atiProjectDetails.dataset.title}`} isFullWidth={true}>
      {hasAccess ? (
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
  //use session to check if user can access ati
  const hasAccess = session ? true : false
  //console.log("id", context?.params?.id)
  //check if apitoken can access this id

  //get the ati details
  //create the callbacks to update ati, using id
  //send props to page
  const atiProjectDetails = {
    dataset: {
      id: "dataset-1",
      title: `${context?.params?.id}`,
      status: "Draft",
      version: "1.0.0",
    },
    datasources: [
      {
        id: "datasource-1",
        name: "datasource 1",
        uri: "uri 1",
      },
      {
        id: "datasource-2",
        name: "datasource 2",
        uri: "uri 2",
      },
    ],
    manuscript: {
      id: "manuscript",
      name: "manuscript",
    },
  }
  return {
    props: {
      hasAccess,
      atiProjectDetails,
    },
  }
}
