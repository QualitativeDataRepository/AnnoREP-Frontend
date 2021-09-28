import { FC } from "react"

import { Button } from "carbon-components-react"

import Layout from "../../components/Layout"

import styles from "./ErrorContainer.module.css"

export interface ErrorContainerProps {
  /** The error message */
  error: string
}

const ErrorContainer: FC<ErrorContainerProps> = ({ error }) => {
  return (
    <Layout title={error}>
      <div className={styles.container}>
        <div className={styles.title}>
          <h1>Something went wrong!</h1>
          <p>{`The page you requested cannot be displayed. ${error}`}</p>
        </div>
        <div>
          <Button
            className={styles.button}
            as="a"
            target="_blank"
            rel="noopener noreferrer"
            href={`https://github.com/adam3smith/AnnoREP-Frontend/issues/new?assignees=&labels=&template=bug_report.md&title=`}
            kind="tertiary"
          >
            Report the issue
          </Button>
        </div>
      </div>
    </Layout>
  )
}

export default ErrorContainer
