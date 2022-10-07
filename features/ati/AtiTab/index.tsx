import { FC, ReactNode } from "react"

import { InlineNotification, Tabs, Tab } from "carbon-components-react"

import Layout from "../../components/Layout"

import { IAtiTab, tabs, AtiTab as AtiTabs } from "../../../constants/ati"
import { IAnnoRepUser } from "../../../types/auth"
import { IDataset } from "../../../types/dataverse"

import styles from "./AtiTab.module.css"

export interface AtiTabProps {
  /** The selected tab */
  selectedTab: IAtiTab
  /** The children of the tab */
  children: ReactNode
  /** Is the user logged in? */
  user: IAnnoRepUser | null
  /** The dataset for the ati project */
  dataset: IDataset | null
}

/** A container for different tabs of an ati project */
const AtiTab: FC<AtiTabProps> = ({ dataset, children, user, selectedTab }: AtiTabProps) => {
  const onSelectionChange = (index: number) =>
    window.location.assign(`/ati/${dataset?.id}/${tabs[index]}`)
  const selectedTabIndex = tabs.findIndex((tab) => tab === selectedTab)

  let content
  if (dataset === null || !user) {
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
          <Tab id={AtiTabs.summary.id} label={AtiTabs.summary.label}>
            {selectedTab === AtiTabs.summary.id && <>{children}</>}
          </Tab>
          <Tab id={AtiTabs.manuscript.id} label={AtiTabs.manuscript.label}>
            {selectedTab === AtiTabs.manuscript.id && <>{children}</>}
          </Tab>
          <Tab id={AtiTabs.exportAnnotations.id} label={AtiTabs.exportAnnotations.label}>
            {selectedTab === AtiTabs.exportAnnotations.id && <>{children}</>}
          </Tab>
          <Tab id={AtiTabs.settings.id} label={AtiTabs.settings.label}>
            {selectedTab === AtiTabs.settings.id && <>{children}</>}
          </Tab>
        </Tabs>
      </>
    )
  }
  return (
    <Layout title={dataset ? `AnnoREP - ${dataset.title}` : "AnnoREP"} user={user}>
      {content}
    </Layout>
  )
}

export default AtiTab
