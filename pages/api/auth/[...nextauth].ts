import NextAuth from "next-auth"
import Providers from "next-auth/providers"
import axios from "axios"

export default NextAuth({
  providers: [
    Providers.Credentials({
      id: "dataverse-login",
      type: "credentials",
      name: "Dataverse Credentials",
      credentials: {
        serverUrl: { label: "Dataverse Server Url", type: "text", placeholder: "demo dv" },
        apiToken: { label: "Dataverse API Token", type: "password" },
      },
      async authorize(credentials) {
        const { status, data } = await axios.post(
          `${process.env.NEXTAUTH_URL}/api/auth/verify-user`,
          { ...credentials },
          {
            headers: {
              accept: "*/*",
              "Content-Type": "application/json",
            },
          }
        )

        // If no error and we have user data, return it
        if (status === 200 && data) {
          //console.log("user", data)
          return data
        }
        // Return null if user data could not be retrieved
        return null
        //valid, redirect to home
        //invalid, stay on page
      },
    }),
  ],
  callbacks: {
    async jwt(token, user) {
      const isSignIn = user ? true : false
      if (isSignIn) {
        token.serverUrl = user?.serverUrl
        token.apiToken = user?.apiToken
      }
      return token
    },
    async session(session, user) {
      session.serverUrl = user?.serverUrl
      session.apiToken = user?.apiToken
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
