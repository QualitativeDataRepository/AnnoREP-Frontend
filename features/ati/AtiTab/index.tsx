import { FC, ReactNode } from "react"

import { InlineNotification, Tabs, Tab } from "carbon-components-react"

import Layout from "../../components/Layout"

import { IAtiTab, tabs, AtiTab } from "../../../constants/ati"
import { IDataset } from "../../../types/dataverse"

import styles from "./AtiTab.module.css"

interface AtiTabProps {
  selectedTab: IAtiTab
  children: ReactNode
  isLoggedIn: boolean
  dataset: IDataset | null
  hasHypotheisClient?: boolean
}

const AtiTabComponent: FC<AtiTabProps> = ({
  dataset,
  children,
  isLoggedIn,
  selectedTab,
  hasHypotheisClient,
}: AtiTabProps) => {
  const onSelectionChange = (index: number) =>
    window.open(`/ati/${dataset?.id}/${tabs[index]}`, "_self")
  const selectedTabIndex = tabs.findIndex((tab) => tab === selectedTab)

  let content
  if (dataset === null || !isLoggedIn) {
    content = (
      <InlineNotification
        hideCloseButton
        lowContrast
        kind={dataset === null ? "error" : "info"}
        subtitle={
          <span>
            {dataset === null ? "You don't have access to this ATI project." : "Please login."}
          </span>
        }
        title={dataset === null ? "Error!" : "Unauthorized!"}
      />
    )
  } else {
    content = (
      <>
        <h1>{dataset?.title}</h1>
        <Tabs
          className={styles.tabs}
          selected={selectedTabIndex}
          onSelectionChange={onSelectionChange}
        >
          <Tab id={AtiTab.summary.id} label={AtiTab.summary.label} />
          <Tab id={AtiTab.manuscript.id} label={AtiTab.manuscript.label} />
          <Tab id={AtiTab.exportAnnotations.id} label={AtiTab.exportAnnotations.label} />
          <Tab id={AtiTab.settings.id} label={AtiTab.settings.label} />
        </Tabs>
        <div>
          <div role="tabpanel" id={`${selectedTab}__panel`} aria-labelledby={selectedTab}>
            {children}
          </div>
        </div>
      </>
    )
  }
  return (
    <Layout
      title={dataset ? `AnnoREP - ${dataset.title}` : "AnnoREP"}
      isLoggedIn={isLoggedIn}
      hasHypotheisClient={hasHypotheisClient}
    >
      {content}
    </Layout>
  )
}

export default AtiTabComponent
