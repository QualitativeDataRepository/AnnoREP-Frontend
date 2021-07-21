import { FC } from "react"

import { Tabs, Tab } from "carbon-components-react"

import AtiExportAnnotations from "../AtiExportAnnotations"
import AtiManuscript from "../AtiManuscript"
import AtiSettings from "../AtiSettings"
import AtiSummary from "../AtiSummary"

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
        <Tab id="summary" label="Summary">
          <AtiSummary serverUrl={serverUrl} atiProjectDetails={atiProjectDetails} />
        </Tab>
        <Tab id="manuscript" label="Manuscript">
          <AtiManuscript
            datasetId={atiProjectDetails.dataset.id}
            doi={atiProjectDetails.dataset.doi}
            manuscriptId={atiProjectDetails.manuscript.id}
            datasources={atiProjectDetails.datasources}
            serverUrl={serverUrl}
          />
        </Tab>
        <Tab id="export-annotations" label="Export annotations">
          <AtiExportAnnotations
            manuscript={atiProjectDetails.manuscript}
            canExportAnnotations={canExportAnnotations}
          />
        </Tab>
        <Tab id="settings" label="Settings">
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
