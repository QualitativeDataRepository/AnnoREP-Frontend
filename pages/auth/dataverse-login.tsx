import { FC, useState } from "react"

import { signIn, SignInResponse } from "next-auth/client"
import { useRouter } from "next/router"

import Layout from "../../features/components/Layout"
import LoginForm from "../../features/dataverse-auth/LoginForm"
import {
  DATAVERSE_LOGIN_ID,
  INVALID_API_TOKEN,
  INVALID_SERVER_URL,
} from "../../constants/dataverse"

const Login: FC = () => {
  const router = useRouter()
  const [serverUrl, setServerUrl] = useState<string>("")
  const [serverUrlIsInvalid, setServerUrlIsInvalid] = useState<boolean>(false)
  const [serverUrlInvalidText, setServerUrlInvalidText] = useState<string>("")
  const handleServerUrlChange = (serverUrl: string) => setServerUrl(serverUrl)

  const [apiToken, setApiToken] = useState<string>("")
  const [apiTokenIsInvalid, setApiTokenIsInvalid] = useState<boolean>(false)
  const [apiTokenInvalidText, setApiTokenInvalidText] = useState<string>("")
  const handleApiTokenChange = (apiToken: string) => setApiToken(apiToken)

  const [rememberUser, setRememberUser] = useState<boolean>(false)
  const handleRememberUser = (rememberUser: boolean) => setRememberUser(rememberUser)

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

  return (
    <Layout title="AnnoREP - Dataverse Login">
      <LoginForm
        serverUrl={serverUrl}
        serverUrlIsInvalid={serverUrlIsInvalid}
        serverUrlInvalidText={serverUrlInvalidText}
        handleServerUrlChange={handleServerUrlChange}
        apiToken={apiToken}
        apiTokenIsInvalid={apiTokenIsInvalid}
        apiTokenInvalidText={apiTokenInvalidText}
        handleApiTokenChange={handleApiTokenChange}
        rememberUser={rememberUser}
        handleRememberUser={handleRememberUser}
        handleLogin={handleLogin}
      />
    </Layout>
  )
}

export default Login
