import { Story, Meta } from "@storybook/react"

import AtiSummary, { AtiSummaryProps } from "."

export default {
  component: AtiSummary,
  title: "ATI/ATI Summary",
} as Meta

const Template: Story<AtiSummaryProps> = (args) => <AtiSummary {...args} />

export const Default = Template.bind({})
Default.args = {
  serverUrl: "https://test.com",
  atiProjectDetails: {
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
    manuscript: {
      id: "manuscript-id",
      name: "Manuscript Name",
    },
    datasources: [
      {
        id: "datasource-id",
        name: "Datasource",
        uri: "https://test.com",
      },
    ],
  },
}
