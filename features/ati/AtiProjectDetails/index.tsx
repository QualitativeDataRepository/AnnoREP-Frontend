import { FC } from "react"

import { Tabs, Tab } from "carbon-components-react"
import { IATIProjectDetails, IDatasource } from "../../../types/dataverse"
import AtiSummary from "../AtiSummary"
import AtiDatasources from "../AtiDatasources"
import AtiManuscript from "../AtiManuscript"
import AtiSettings from "../AtiSettings"

interface ATIProjectDetailsProps {
  atiProjectDetails: IATIProjectDetails
}

const ATIProjectDetails: FC<ATIProjectDetailsProps> = ({ atiProjectDetails }) => {
  return (
    <>
      <h1>{atiProjectDetails.dataset.title}</h1>
      <Tabs>
        <Tab id="summary" label="Summary">
          <AtiSummary atiProjectDetails={atiProjectDetails} />
        </Tab>
        <Tab id="manuscript" label="Manuscript">
          <AtiManuscript
            manuscriptId={atiProjectDetails.manuscript.id}
            datasources={atiProjectDetails.datasources}
          />
        </Tab>
        <Tab id="datasources" label="Datasources">
          <AtiDatasources
            atiProject={atiProjectDetails.dataset.title}
            datasources={atiProjectDetails.datasources}
            handleSave={(rows: IDatasource[]) => rows}
          />
        </Tab>
        <Tab id="settings" label="Settings">
          <AtiSettings dataset={atiProjectDetails.dataset} />
        </Tab>
      </Tabs>
    </>
  )
}

export default ATIProjectDetails
