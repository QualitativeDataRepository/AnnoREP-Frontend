import { FC } from "react"

import { getSession } from "next-auth/client"
import { GetServerSideProps } from "next"

import NewAtiProjectForm from "../../features/ati/NewAtiProjectForm"
import Layout from "../../features/components/Layout"

import { IDataset } from "../../types/dataverse"

interface NewAtiProps {
  session: any
  datasets: IDataset[]
}

const NewAti: FC<NewAtiProps> = ({ session, datasets }) => {
  return (
    <Layout title="AnnoREP - New ATI Project">
      {session ? (
        <NewAtiProjectForm datasets={datasets} />
      ) : (
        <div>Login to create a new ATI project.</div>
      )}
    </Layout>
  )
}

export default NewAti

export const getServerSideProps: GetServerSideProps = async (context) => {
  const session = await getSession(context)
  const datasets: IDataset[] = [
    {
      id: "dataset-1",
      title: "dataset 1",
    },
    {
      id: "dataset-2",
      title: "dataset 2",
    },
  ]
  //get the datasets from DV
  //callback to redirect to ati/[id] when finished
  //callback to post ati
  return {
    props: {
      session,
      datasets,
    },
  }
}
