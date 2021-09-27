import { Story, Meta } from "@storybook/react"

import AtiTab, { AtiTabProps } from "."

export default {
  component: AtiTab,
  title: "ATI/ATI Tab",
} as Meta

const Template: Story<AtiTabProps> = (args) => <AtiTab {...args} />

const args = {
  isLoggedIn: true,
  dataset: {
    id: "dataset-id",
    doi: "doi",
    title: "Dataset",
    description: "Description",
    zip: "base 64 zip of the project bundle",
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
  children: <div>ATI summary tab</div>,
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
