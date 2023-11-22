import { FC } from "react"

import { getSession } from "next-auth/react"
import { GetServerSideProps } from "next"

import AppGuide from "../../features/components/AppGuide"
import Layout from "../../features/components/Layout"

import { IAnnoRepUser } from "../../types/auth"
import { getAnnoRepUser } from "../../utils/authUtils"

interface GuideProps {
  user: IAnnoRepUser | null
}

const Guide: FC<GuideProps> = ({ user }) => {
  return (
    <Layout user={user} title="AnnoREP - Guide">
      <AppGuide isLoggedIn={user ? true : false} />
    </Layout>
  )
}

export default Guide

export const getServerSideProps: GetServerSideProps = async (context) => {
  const session = await getSession(context)
  const user = getAnnoRepUser(session, process.env.DATAVERSE_SERVER_URL)
  const props: GuideProps = {
    user,
  }

  return {
    props,
  }
}
