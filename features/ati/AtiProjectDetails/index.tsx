import { FC } from "react"

import { Tabs, Tab, InlineNotification } from "carbon-components-react"
import { useRouter } from "next/router"

import AtiExportAnnotations from "../AtiExportAnnotations"
import AtiManuscript from "../AtiManuscript"
import AtiSettings from "../AtiSettings"
import AtiSummary from "../AtiSummary"

import { AtiTab, IAtiTab, tabs } from "../../../constants/ati"
import { IATIProjectDetails } from "../../../types/dataverse"

import styles from "./AtiProjectDetails.module.css"

interface ATIProjectDetailsProps {
  serverUrl: string
  atiProjectDetails: IATIProjectDetails
  atiTab: IAtiTab
}

const ATIProjectDetails: FC<ATIProjectDetailsProps> = ({
  serverUrl,
  atiProjectDetails,
  atiTab,
}) => {
  const router = useRouter()
  const onSelectionChange = (index: number) => {
    const newUrl = `/ati/${router.query.id}?atiTab=${tabs[index]}`
    router.push(newUrl, undefined, { shallow: true })
  }
  const selectedTab = atiTab
    ? Math.max(
        0,
        tabs.findIndex((tab) => tab === atiTab)
      )
    : 0
  return (
    <>
      <h1>{atiProjectDetails.dataset.title}</h1>
      <Tabs className={styles.tabs} selected={selectedTab} onSelectionChange={onSelectionChange}>
        <Tab {...AtiTab.summary}>
          <AtiSummary serverUrl={serverUrl} atiProjectDetails={atiProjectDetails} />
        </Tab>
        <Tab {...AtiTab.manuscript}>
          <AtiManuscript
            datasetId={atiProjectDetails.dataset.id}
            doi={atiProjectDetails.dataset.doi}
            manuscriptId={atiProjectDetails.manuscript.id}
            manuscriptName={atiProjectDetails.manuscript.name}
            datasources={atiProjectDetails.datasources}
            serverUrl={serverUrl}
          />
        </Tab>
        <Tab {...AtiTab.exportAnnotations}>
          {atiProjectDetails.manuscript.id ? (
            <AtiExportAnnotations manuscript={atiProjectDetails.manuscript} />
          ) : (
            <InlineNotification
              hideCloseButton
              lowContrast
              kind="info"
              subtitle={<span>This project has no annotations to export.</span>}
              title="No manuscript found!"
            />
          )}
        </Tab>
        <Tab {...AtiTab.settings}>
          <AtiSettings
            dataset={atiProjectDetails.dataset}
            manuscript={atiProjectDetails.manuscript}
          />
        </Tab>
      </Tabs>
    </>
  )
}

export default ATIProjectDetails
