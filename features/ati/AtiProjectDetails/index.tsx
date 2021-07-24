import { FC } from "react"

import { Tabs, Tab } from "carbon-components-react"

import AtiExportAnnotations from "../AtiExportAnnotations"
import AtiManuscript from "../AtiManuscript"
import AtiSettings from "../AtiSettings"
import AtiSummary from "../AtiSummary"

import { AtiTab } from "../../../constants/ati"
import { IATIProjectDetails } from "../../../types/dataverse"

interface ATIProjectDetailsProps {
  serverUrl: string
  atiProjectDetails: IATIProjectDetails
  canExportAnnotations: boolean
}

const ATIProjectDetails: FC<ATIProjectDetailsProps> = ({
  serverUrl,
  atiProjectDetails,
  canExportAnnotations,
}) => {
  return (
    <>
      <h1>{atiProjectDetails.dataset.title}</h1>
      <Tabs>
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
