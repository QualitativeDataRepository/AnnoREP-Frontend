import { FC, useState } from "react"

import { GetServerSideProps } from "next"
import { getSession, signIn, SignInResponse } from "next-auth/client"
import { useRouter } from "next/router"

import Layout from "../../features/components/Layout"
import LoginForm from "../../features/dataverse-auth/LoginForm"
import {
  DATAVERSE_LOGIN_ID,
  INVALID_API_TOKEN,
  INVALID_SERVER_URL,
} from "../../constants/dataverse"

interface LoginProps {
  isLoggedIn: boolean
}

const Login: FC<LoginProps> = ({ isLoggedIn }) => {
  const router = useRouter()
  const [serverUrl, setServerUrl] = useState<string>("")
  const [serverUrlIsInvalid, setServerUrlIsInvalid] = useState<boolean>(false)
  const [serverUrlInvalidText, setServerUrlInvalidText] = useState<string>("")
  const handleServerUrlChange = (serverUrl: string) => setServerUrl(serverUrl)

  const [apiToken, setApiToken] = useState<string>("")
  const [apiTokenIsInvalid, setApiTokenIsInvalid] = useState<boolean>(false)
  const [apiTokenInvalidText, setApiTokenInvalidText] = useState<string>("")
  const handleApiTokenChange = (apiToken: string) => setApiToken(apiToken)

  const handleLogin = () => {
    signIn(DATAVERSE_LOGIN_ID, { redirect: false, serverUrl, apiToken }).then((res) => {
      const loginRes = (res as unknown) as SignInResponse
      if (loginRes.error) {
        if (loginRes.error === INVALID_SERVER_URL) {
          setServerUrlIsInvalid(true)
          setServerUrlInvalidText(INVALID_SERVER_URL)
          setApiTokenIsInvalid(false)
        } else {
          setApiTokenIsInvalid(true)
          setApiTokenInvalidText(INVALID_API_TOKEN)
          setServerUrlIsInvalid(false)
        }
      } else {
        router.push("/")
      }
    })
  }

  if (isLoggedIn) {
    router.push("/")
  }

  return (
    <Layout isLoggedIn={false} title="AnnoREP - Dataverse Login">
      <LoginForm
        serverUrl={serverUrl}
        serverUrlIsInvalid={serverUrlIsInvalid}
        serverUrlInvalidText={serverUrlInvalidText}
        handleServerUrlChange={handleServerUrlChange}
        apiToken={apiToken}
        apiTokenIsInvalid={apiTokenIsInvalid}
        apiTokenInvalidText={apiTokenInvalidText}
        handleApiTokenChange={handleApiTokenChange}
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
    },
  }
}
