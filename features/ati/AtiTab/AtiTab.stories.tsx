import { Story, Meta } from "@storybook/react"

import AtiTab, { AtiTabProps } from "."

export default {
  component: AtiTab,
  title: "ATI/ATI Tab",
} as Meta

const Template: Story<AtiTabProps> = (args) => <AtiTab {...args} />

const args = {
  user: {
    dataverse: {
      name: "User name @ QDR",
      link: "test.com",
    },
    hypothesis: {
      name: "User name @ Hypothes.is",
      link: "test.com",
    },
  },
  dataset: {
    id: "dataset-id",
    doi: "doi",
    title: "Dataset",
    description: "Description",
    subjects: ["Subject"],
    publicationStatuses: ["Draft"],
    citationHtml: "Citation HTML",
  },
  hasPdf: false,
}

export const AtiSummary = Template.bind({})
AtiSummary.args = {
  ...args,
  selectedTab: "summary",
  children: <div>ATI Summary tab</div>,
}

export const AtiManuscript = Template.bind({})
AtiManuscript.args = {
  ...args,
  selectedTab: "manuscript",
  children: <div>ATI Manuscript tab</div>,
}

export const AtiExportAnnotations = Template.bind({})
AtiExportAnnotations.args = {
  ...args,
  selectedTab: "exportAnnotations",
  children: <div>ATI Export Annotations tab</div>,
}

export const AtiSettings = Template.bind({})
AtiSettings.args = {
  ...args,
  selectedTab: "settings",
  children: <div>ATI Settings tab</div>,
}
