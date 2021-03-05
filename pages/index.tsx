import Head from "next/head"
import styles from "../styles/Home.module.css"

const Home = (): JSX.Element => {
  return (
    <div className={styles.container}>
      <Head>
        <title>Anno REP</title>
      </Head>

      <main className={styles.main}>
        <h1 className={styles.title}>AnnoREP</h1>
      </main>
    </div>
  )
}

export default Home
