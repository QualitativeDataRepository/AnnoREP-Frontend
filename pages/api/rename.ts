import type { NextApiRequest, NextApiResponse } from "next"

export default function handler(req: NextApiRequest, res: NextApiResponse) {
  if (req.method === "POST") {
    //console.log("rename", req.body)
    //get the session
    //axios req to rename ati project
    res.status(200).json({ msg: "success" })
  } else {
    res.send("POST only")
  }
}
