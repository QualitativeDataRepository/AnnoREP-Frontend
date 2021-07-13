import { FC, useState, useEffect } from "react"

import { GetServerSideProps } from "next"
import { getSession, signIn, SignInResponse } from "next-auth/client"
import { useRouter } from "next/router"

import Layout from "../../features/components/Layout"
import LoginForm from "../../features/auth/LoginForm"
import {
  INVALID_DATAVERSE_API_TOKEN,
  INVALID_HYPOTHESIS_API_TOKEN,
  LOGIN_ID,
  SEPARATOR,
} from "../../features/auth/constants"

interface LoginProps {
  serverUrl: string
  isLoggedIn: boolean
}

const Login: FC<LoginProps> = ({ isLoggedIn, serverUrl }) => {
  const router = useRouter()

  const [dataverseApiToken, setDataverseApiToken] = useState<string>("")
  const [dataverseApiTokenIsInvalid, setDataverseApiTokenIsInvalid] = useState<boolean>(false)
  const [dataverseApiTokenInvalidText, setDataverseApiTokenInvalidText] = useState<string>("")
  const handleDataverseApiTokenChange = (apiToken: string) => setDataverseApiToken(apiToken)

  const [hypothesisApiToken, setHypothesisApiToken] = useState<string>("")
  const [hypothesisApiTokenIsInvalid, setHypothesisApiTokenIsInvalid] = useState<boolean>(false)
  const [hypothesisApiTokenInvalidText, setHypothesisApiTokenInvalidText] = useState<string>("")
  const handleHypothesisApiTokenChange = (apiToken: string) => setHypothesisApiToken(apiToken)

  const handleLogin = () => {
    signIn(LOGIN_ID, { redirect: false, dataverseApiToken, hypothesisApiToken }).then((res) => {
      const loginRes = (res as unknown) as SignInResponse
      if (loginRes.error) {
        const [dataverseIsInvalid, hypothesisIsInvalid] = loginRes.error.split(SEPARATOR)
        if (JSON.parse(dataverseIsInvalid)) {
          setDataverseApiTokenIsInvalid(true)
          setDataverseApiTokenInvalidText(INVALID_DATAVERSE_API_TOKEN)
        }
        if (JSON.parse(hypothesisIsInvalid)) {
          setHypothesisApiTokenIsInvalid(true)
          setHypothesisApiTokenInvalidText(INVALID_HYPOTHESIS_API_TOKEN)
        }
      } else {
        router.push("/")
      }
    })
  }

  useEffect(() => {
    if (isLoggedIn) {
      router.push("/")
    }
  }, [isLoggedIn])

  return (
    <Layout isLoggedIn={false} title="AnnoREP - Login">
      <LoginForm
        dataverseServerUrl={serverUrl}
        dataverseApiToken={dataverseApiToken}
        dataverseApiTokenIsInvalid={dataverseApiTokenIsInvalid}
        dataverseApiTokenInvalidText={dataverseApiTokenInvalidText}
        hypothesisApiToken={hypothesisApiToken}
        hypothesisApiTokenIsInvalid={hypothesisApiTokenIsInvalid}
        hypothesisApiTokenInvalidText={hypothesisApiTokenInvalidText}
        handleDataverseApiTokenChange={handleDataverseApiTokenChange}
        handleHypothesisApiTokenChange={handleHypothesisApiTokenChange}
        handleLogin={handleLogin}
      />
    </Layout>
  )
}

export default Login

export const getServerSideProps: GetServerSideProps = async (context) => {
  const session = await getSession(context)
  return {
    props: {
      isLoggedIn: session ? true : false,
      serverUrl: process.env.DATAVERSE_SERVER_URL,
    },
  }
}
