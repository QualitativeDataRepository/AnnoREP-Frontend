import axios from "axios"
import NextAuth from "next-auth"
import Providers from "next-auth/providers"

import { DATAVERSE_HEADER_NAME } from "../../../constants/dataverse"
import { INVALID_HYPOTHESIS_API_TOKEN, LOGIN_ID } from "../../../features/auth/constants"

interface Creds {
  dataverseApiToken: string
  hypothesisApiToken: string
}

export default NextAuth({
  providers: [
    Providers.Credentials({
      id: LOGIN_ID,
      type: "credentials",
      name: "Dataverse and Hypothes.is Credentials",
      credentials: {
        dataverseApiToken: { label: "Dataverse API Token", type: "password" },
        hypothesisApiToken: { label: "Hypothes.is API Token", type: "password" },
      },
      async authorize(credentials) {
        const creds = { ...credentials } as Creds
        const user = {
          dataverseApiToken: "",
          hypothesisApiToken: "",
          hypothesisUserId: null,
        }
        let dataverseErrorMsg
        try {
          const { status, data } = await axios.get(
            `${process.env.DATAVERSE_SERVER_URL}/api/users/:me`,
            {
              headers: {
                [DATAVERSE_HEADER_NAME]: creds.dataverseApiToken.trim(),
              },
            }
          )
          if (status === 200 && data.status === "OK") {
            user.dataverseApiToken = creds.dataverseApiToken.trim()
          }
        } catch (e) {
          dataverseErrorMsg = (e as any).response.data.message
        }
        try {
          const { data } = await axios.get(`${process.env.HYPOTHESIS_SERVER_URL}/api/profile`, {
            headers: {
              Authorization: `Bearer ${creds.hypothesisApiToken.trim()}`,
            },
          })
          if (data.userid !== null) {
            user.hypothesisApiToken = creds.hypothesisApiToken.trim()
            user.hypothesisUserId = data.userid
          }
        } catch (e) {
          console.warn(`Failed to login to Hypothes.is: ${e}`)
        }

        if (user.dataverseApiToken === "" || user.hypothesisApiToken === "") {
          throw new Error(
            JSON.stringify([
              {
                hasError: user.dataverseApiToken === "",
                errorMsg: dataverseErrorMsg,
              },
              {
                hasError: user.hypothesisApiToken === "",
                errorMsg: INVALID_HYPOTHESIS_API_TOKEN,
              },
            ])
          )
        } else {
          return user
        }
      },
    }),
  ],
  callbacks: {
    async jwt(token, user) {
      const isSignIn = user ? true : false
      if (isSignIn) {
        token.dataverseApiToken = user?.dataverseApiToken
        token.hypothesisApiToken = user?.hypothesisApiToken
        token.hypothesisUserId = user?.hypothesisUserId
        //token.name = user?.name
        //token.email = user?.email
      }
      return token
    },
    async session(session, user) {
      session.dataverseApiToken = user?.dataverseApiToken
      session.hypothesisApiToken = user?.hypothesisApiToken
      session.hypothesisUserId = user?.hypothesisUserId
      //session.user = user
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
