import { FC, ReactNode } from "react"

import { InlineNotification, Tabs, Tab, TabList, TabPanels, TabPanel } from "@carbon/react"

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
        title={dataset === null ? "Error!" : "Unauthorized!"}
      >
        {dataset === null ? "You don't have access to this ATI project." : "Please login."}
      </InlineNotification>
    )
  } else {
    content = (
      <>
        <h1>{dataset?.title}</h1>
        <div className={styles.tabs}>
          <Tabs
            selectedIndex={selectedTabIndex}
            onChange={({ selectedIndex }) => onSelectionChange(selectedIndex)}
          >
            <TabList aria-label="ATI Project Tabs">
              <Tab>{AtiTabs.summary.label}</Tab>
              <Tab>{AtiTabs.manuscript.label}</Tab>
              <Tab>{AtiTabs.exportAnnotations.label}</Tab>
              <Tab>{AtiTabs.settings.label}</Tab>
            </TabList>
            <TabPanels>
              <TabPanel>{selectedTab === AtiTabs.summary.id && <>{children}</>}</TabPanel>
              <TabPanel>{selectedTab === AtiTabs.manuscript.id && <>{children}</>}</TabPanel>
              <TabPanel>{selectedTab === AtiTabs.exportAnnotations.id && <>{children}</>}</TabPanel>
              <TabPanel>{selectedTab === AtiTabs.settings.id && <>{children}</>}</TabPanel>
            </TabPanels>
          </Tabs>
        </div>
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
