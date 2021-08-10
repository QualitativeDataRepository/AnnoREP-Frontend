import { FC } from "react"

import { Tabs, Tab } from "carbon-components-react"
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
  canExportAnnotations: boolean
  atiTab: IAtiTab
}

const ATIProjectDetails: FC<ATIProjectDetailsProps> = ({
  serverUrl,
  atiProjectDetails,
  canExportAnnotations,
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
            datasources={atiProjectDetails.datasources}
            serverUrl={serverUrl}
          />
        </Tab>
        <Tab {...AtiTab.exportAnnotations}>
          <AtiExportAnnotations
            manuscript={atiProjectDetails.manuscript}
            canExportAnnotations={canExportAnnotations}
          />
        </Tab>
        <Tab {...AtiTab.settings}>
          <AtiSettings
            dataset={atiProjectDetails.dataset}
            manuscriptId={atiProjectDetails.manuscript.id}
          />
        </Tab>
      </Tabs>
    </>
  )
}

export default ATIProjectDetails
