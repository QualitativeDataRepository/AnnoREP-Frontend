import { useState } from "react"

import { signIn } from "next-auth/client"

import LoginForm from "../../features/dataverse-auth/LoginForm"

const Login = (): JSX.Element => {
  const [serverUrl, setServerUrl] = useState<string>("")
  // eslint-disable-next-line no-unused-vars, @typescript-eslint/no-unused-vars
  const [serverUrlIsInvalid, setServerUrlIsInvalid] = useState<boolean>(false)
  // eslint-disable-next-line no-unused-vars, @typescript-eslint/no-unused-vars
  const [serverUrlInvalidText, setServerUrlInvalidText] = useState<string>("")
  const handleServerUrlChange = (serverUrl: string) => setServerUrl(serverUrl)

  const [apiToken, setApiToken] = useState<string>("")
  // eslint-disable-next-line no-unused-vars, @typescript-eslint/no-unused-vars
  const [apiTokenIsInvalid, setApiTokenIsInvalid] = useState<boolean>(false)
  // eslint-disable-next-line no-unused-vars, @typescript-eslint/no-unused-vars
  const [apiTokenInvalidText, setApiTokenInvalidText] = useState<string>("")
  const handleApiTokenChange = (apiToken: string) => setApiToken(apiToken)

  const [rememberUser, setRememberUser] = useState<boolean>(false)
  const handleRememberUser = (rememberUser: boolean) => setRememberUser(rememberUser)

  //handle stay on page if error
  //redirect if session created
  const handleLogin = () => signIn("dataverse-login", { serverUrl, apiToken, callbackUrl: "/" })

  return (
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
  )
}

export default Login
