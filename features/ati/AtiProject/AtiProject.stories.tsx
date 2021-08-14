import { Story, Meta } from "@storybook/react"

import AtiProject, { AtiProjectProps } from "."

export default {
  component: AtiProject,
  title: "ATI/ATI Project",
} as Meta

const Template: Story<AtiProjectProps> = (args) => <AtiProject {...args} />

export const Default = Template.bind({})
Default.args = {
  id: "ati-project-id-1",
  title: "ATI Project Title",
  description: "Test desc",
  version: "1.0.0",
  status: "Draft",
}
