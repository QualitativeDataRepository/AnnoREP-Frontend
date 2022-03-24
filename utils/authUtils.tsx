import { Session } from "next-auth"

import { IAnnoRepUser } from "../types/auth"

export function getAnnoRepUser(
  session: Session | null,
  dataverseServerUrl?: string
): IAnnoRepUser | null {
  if (!dataverseServerUrl) {
    throw new Error("DATAVERSE_SERVER_URL is not set.")
  }
  if (!session) {
    return null
  }

  // `session.hypothesisUserId` will be a string of the format "acct:username@authority"
  const hypthesisUserName = (session.hypothesisUserId as string).split(":")[1].split("@")[0]
  return {
    dataverse: {
      name: `${session.dataverseUserName} @ QDR`,
      link: `${dataverseServerUrl}/dataverseuser.xhtml`,
    },
    hypothesis: {
      name: `${hypthesisUserName} @ Hypothes.is`,
      link: `https://hypothes.is/users/${hypthesisUserName}`,
    },
  }
}
