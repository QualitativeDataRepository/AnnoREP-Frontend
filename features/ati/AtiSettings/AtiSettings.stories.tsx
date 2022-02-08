import { Story, Meta } from "@storybook/react"

import AtiSettings, { AtiSettingsProps } from "."

export default {
  component: AtiSettings,
  title: "ATI/ATI Settings",
} as Meta

const Template: Story<AtiSettingsProps> = (args) => <AtiSettings {...args} />

export const Default = Template.bind({})
Default.args = {
  dataset: {
    id: "dataset-id",
    doi: "doi",
    title: "Dataset title",
  },
  manuscript: {
    id: "manuscript-id",
    name: "Manuscript name",
  },
}
