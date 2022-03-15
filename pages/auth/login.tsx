import { FC, useEffect } from "react"

import { GetServerSideProps } from "next"
import { getSession, signIn } from "next-auth/client"
import { useRouter } from "next/router"

import useCredential, {
  initialCredentialState,
  CredentialActionType,
} from "../../hooks/useCredential"

import Layout from "../../features/components/Layout"
import LoginForm from "../../features/auth/LoginForm"
import { LOGIN_ID } from "../../features/auth/constants"

interface LoginProps {
  serverUrl: string
  isLoggedIn: boolean
}

const Login: FC<LoginProps> = ({ isLoggedIn, serverUrl }) => {
  const router = useRouter()

  const { state: dataverseApiTokenState, dispatch: dataverseApiTokenDispatch } =
    useCredential(initialCredentialState)
  const { state: hypothesisApiTokenState, dispatch: hypothesisApiTokenDispatch } =
    useCredential(initialCredentialState)

  const handleDataverseApiTokenChange = (apiToken: string) =>
    dataverseApiTokenDispatch({ type: CredentialActionType.UPDATE, payload: apiToken })
  const handleHypothesisApiTokenChange = (apiToken: string) =>
    hypothesisApiTokenDispatch({ type: CredentialActionType.UPDATE, payload: apiToken })

  const handleLogin = () => {
    signIn(LOGIN_ID, {
      redirect: false,
      dataverseApiToken: dataverseApiTokenState.credential,
      hypothesisApiToken: hypothesisApiTokenState.credential,
    }).then((loginRes) => {
      if (loginRes) {
        if (loginRes.error) {
          const errorJson = JSON.parse(loginRes.error)
          dataverseApiTokenDispatch({
            type: CredentialActionType.VALIDATE,
            payload: { isInvalid: errorJson[0].hasError, invalidText: errorJson[0].errorMsg },
          })
          hypothesisApiTokenDispatch({
            type: CredentialActionType.VALIDATE,
            payload: { isInvalid: errorJson[1].hasError, invalidText: errorJson[1].errorMsg },
          })
        } else {
          router.push("/")
        }
      }
    })
  }

  useEffect(() => {
    if (isLoggedIn) {
      router.push("/")
    }
  }, [isLoggedIn, router])

  return (
    <Layout isLoggedIn={false} title="AnnoREP - Login">
      <LoginForm
        dataverseServerUrl={serverUrl}
        dataverseApiToken={dataverseApiTokenState.credential}
        dataverseApiTokenIsInvalid={dataverseApiTokenState.isInvalid}
        dataverseApiTokenInvalidText={dataverseApiTokenState.invalidText}
        hypothesisApiToken={hypothesisApiTokenState.credential}
        hypothesisApiTokenIsInvalid={hypothesisApiTokenState.isInvalid}
        hypothesisApiTokenInvalidText={hypothesisApiTokenState.invalidText}
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
