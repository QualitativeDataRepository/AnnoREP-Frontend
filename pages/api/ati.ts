import type { NextApiRequest, NextApiResponse } from "next"

export default function handler(req: NextApiRequest, res: NextApiResponse) {
  if (req.method === "POST") {
    //console.log(req.body)
    //get the session
    //use the serverurl and apitoken
    //use axios to make req

    //if dataset
    //mark it as ar
    //if manuscript, parse manusript, upload manu, upload annotations
    //if datasources, upload datasources

    //if no dataset
    //mark it as ar
    //if manuscript, parse manusript, upload manu, upload annotations
    //if datasources, upload datasources

    //redirect to page /ati/[ati_id]

    //how to get the file content itself? check carbon
    res.status(200).json({ test: "test" })
  } else {
    res.send("POST only")
  }
}
