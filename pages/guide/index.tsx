import { FC } from "react"

import { getSession } from "next-auth/client"
import { GetServerSideProps } from "next"

import AppGuide from "../../features/components/AppGuide"
import Layout from "../../features/components/Layout"

interface GuideProps {
  isLoggedIn: boolean
}

const Guide: FC<GuideProps> = ({ isLoggedIn }) => {
  return (
    <Layout isLoggedIn={isLoggedIn} title="AnnoREP - Guide">
      <AppGuide isLoggedIn={isLoggedIn} />
    </Layout>
  )
}

export default Guide

export const getServerSideProps: GetServerSideProps = async (context) => {
  const session = await getSession(context)
  const props: GuideProps = {
    isLoggedIn: session ? true : false,
  }

  return {
    props,
  }
}
