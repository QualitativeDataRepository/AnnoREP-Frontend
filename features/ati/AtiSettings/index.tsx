import { FC, FormEventHandler, useState } from "react"

import axios from "axios"
import { Button, Form, Loading, InlineNotification } from "carbon-components-react"
import { useRouter } from "next/router"

import { IDataset } from "../../../types/dataverse"
import { getMessageFromError } from "../../../utils/httpRequestUtils"

import styles from "./AtiSettings.module.css"
import layoutStyles from "../../components/Layout/Layout.module.css"

interface AtiSettingsProps {
  dataset: IDataset
  manuscriptId: string
}

const AtiSettings: FC<AtiSettingsProps> = ({ dataset, manuscriptId }) => {
  const router = useRouter()
  const [isLoading, setIsLoading] = useState<boolean>(false)
  const [errorMsg, setErrorMsg] = useState<string>("")
  const onSubmit: FormEventHandler<HTMLFormElement> = async (e) => {
    e.preventDefault()
    setIsLoading(true)
    setErrorMsg("")
    await axios
      .put(`/api/datasets/${dataset.id}/annorep/delete`)
      .then(() => {
        if (manuscriptId) {
          return axios.delete(`/api/delete-file/${manuscriptId}`)
        }
      })
      .then(() => {
        setIsLoading(false)
        router.push("/")
      })
      .catch((error) => {
        setIsLoading(false)
        setErrorMsg(`${getMessageFromError(error)}`)
      })
  }
  return (
    <div className={layoutStyles.maxwidth}>
      {isLoading && <Loading description="Deleting ATI project" />}
      <h2>Danger zone</h2>
      <div className={styles.dangerzone}>
        <Form onSubmit={onSubmit}>
          <div className={styles.title}>
            Delete <abbr>ATI</abbr> project
          </div>
          <p className={styles.desc}>
            Unmark the Dataverse dataset as an <abbr>ATI</abbr> project and remove the manuscript
            file.
          </p>
          {errorMsg && (
            <div className="ar--form-item">
              <InlineNotification
                hideCloseButton
                kind="error"
                subtitle={<span>{errorMsg}</span>}
                title="Error"
              />
            </div>
          )}
          <Button type="submit" kind="danger" size="sm">
            Delete
          </Button>
        </Form>
      </div>
    </div>
  )
}

export default AtiSettings
