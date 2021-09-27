import { Story, Meta } from "@storybook/react"

import ATISummary, { ATISummaryProps } from "."

export default {
  component: ATISummary,
  title: "ATI/ATI Summary",
} as Meta

const Template: Story<ATISummaryProps> = (args) => <ATISummary {...args} />

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
