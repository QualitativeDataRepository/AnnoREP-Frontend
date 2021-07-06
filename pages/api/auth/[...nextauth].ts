import axios, { AxiosError } from "axios"
import NextAuth from "next-auth"
import Providers from "next-auth/providers"

import {
  DATAVERSE_HEADER_NAME,
  DATAVERSE_LOGIN_ID,
  INVALID_API_TOKEN,
  INVALID_SERVER_URL,
} from "../../../constants/dataverse"

interface Creds {
  serverUrl: string
  apiToken: string
}

export default NextAuth({
  providers: [
    Providers.Credentials({
      id: DATAVERSE_LOGIN_ID,
      type: "credentials",
      name: "Dataverse Credentials",
      credentials: {
        serverUrl: { label: "Dataverse Server Url", type: "text", placeholder: "demo dv" },
        apiToken: { label: "Dataverse API Token", type: "password" },
      },
      async authorize(credentials) {
        const creds = { ...credentials } as Creds
        let user
        let msg
        try {
          const { status, data } = await axios.get(`${creds.serverUrl}/api/users/:me`, {
            headers: {
              [DATAVERSE_HEADER_NAME]: creds.apiToken,
            },
          })

          if (status === 200 && data.status === "OK") {
            const userData = {
              ...creds,
              name: data.data.displayName,
              email: data.data.email,
            }
            user = userData
          }
        } catch (error) {
          const axiosError = error as AxiosError
          if (axiosError.response?.status === 400) {
            msg = INVALID_API_TOKEN
          } else {
            msg = INVALID_SERVER_URL
          }
        }
        if (user) {
          return user
        } else {
          throw new Error(msg)
        }
      },
    }),
  ],
  callbacks: {
    async jwt(token, user) {
      const isSignIn = user ? true : false
      if (isSignIn) {
        token.serverUrl = user?.serverUrl
        token.apiToken = user?.apiToken
        token.name = user?.name
        token.email = user?.email
      }
      return token
    },
    async session(session, user) {
      session.serverUrl = user?.serverUrl
      session.apiToken = user?.apiToken
      session.user = user
      return session
    },
    async redirect(url, baseUrl) {
      return url.startsWith(baseUrl) ? url : `${baseUrl}${url}`
    },
  },
  secret: process.env.SECRET,
  session: {
    jwt: true,
    maxAge: 30 * 24 * 60 * 60,
  },
  jwt: {
    secret: process.env.SECRET,
    encryption: true,
  },
})
