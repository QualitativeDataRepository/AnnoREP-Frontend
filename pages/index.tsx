import { FC } from "react"

import { GetServerSideProps } from "next"
import { getSession } from "next-auth/client"

import { Add16 } from "@carbon/icons-react"
import { Link } from "carbon-components-react"

import AtiProject from "../features/ati/AtiProject"
import Layout from "../features/components/Layout"

import { IAtiProject } from "../types/ati"

import styles from "../styles/Home.module.css"

interface HomeProps {
  session: any
  atiProjects: IAtiProject[]
}
const Home: FC<HomeProps> = ({ session, atiProjects }) => {
  return (
    <Layout title="AnnoREP">
      <div>
        {session ? (
          <div>
            <div className={styles.titlecontainer}>
              <h1>ATI Projects</h1>
              <Link href="/new" renderIcon={Add16}>
                New ATI Project
              </Link>
            </div>
            {atiProjects.map(({ id, title, version, status }) => (
              <AtiProject key={id} id={id} title={title} version={version} status={status} />
            ))}
            {atiProjects.length === 0 && <div>No current ati projects</div>}
          </div>
        ) : (
          <div className={styles.callout}>
            <h1>AnnoREP</h1>
            <p>
              AnnoREP is an open-source, web-based tool that will help facilitate{" "}
              <a href={"https://qdr.syr.edu/ati"}>Annotation for Transprent Inquiry (ATI)</a> and
              other annotation-based workflows.
            </p>
            <div>
              <Link href="/new" renderIcon={Add16} size="lg">
                New ATI Project
              </Link>
            </div>
          </div>
        )}
      </div>
    </Layout>
  )
}

export default Home

export const getServerSideProps: GetServerSideProps = async (context) => {
  const session = await getSession(context)
  let atiProjects: IAtiProject[] = []
  if (session) {
    /*const { status, data } = await axios.get<IAtiProject[]>(
      //TODO: change to X-Dataverse-key header later
      `${session.serverUrl}/api/mydata/retrieve?key=${session.apiToken}`,
    )*/
    //filter to only atis
    //atiProjects = data;
    atiProjects = [
      {
        id: "test-1",
        title: "project 1",
        status: "Draft",
        version: "1.0.0",
      },
      {
        id: "test-2",
        title: "project 2",
        status: "Draft",
        version: "1.0.0",
      },
    ]
  }
  return {
    props: { session, atiProjects },
  }
}
