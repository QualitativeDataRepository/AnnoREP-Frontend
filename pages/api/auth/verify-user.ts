import type { NextApiRequest, NextApiResponse } from "next"

export default function handler(req: NextApiRequest, res: NextApiResponse) {
  if (req.method === "POST") {
    //add logic to verify api token is valid
    //add logic server url is valid
    res.status(200).json({ serverUrl: req.body.serverUrl, apiToken: req.body.apiToken })
  } else {
    res.send("POST only")
  }
}
