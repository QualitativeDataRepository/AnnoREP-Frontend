import { DefaultSession } from "next-auth"

declare module "next-auth" {
  interface Session extends DefaultSession {
    dataverseApiToken?: string
    dataverseUserName?: string
    hypothesisApiToken?: string
    hypothesisUserId?: string
  }

  interface User {
    dataverseApiToken?: string
    dataverseUserName?: string
    hypothesisApiToken?: string
    hypothesisUserId?: string
  }
}

declare module "next-auth/jwt" {
  interface JWT {
    dataverseApiToken?: string
    dataverseUserName?: string
    hypothesisApiToken?: string
    hypothesisUserId?: string
  }
}
