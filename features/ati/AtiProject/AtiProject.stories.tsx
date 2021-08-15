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
  name: "ATI Project Title",
  description: "Test desc",
  dataverseName: "Dataverse name",
  citationHtml: "Citation HTML",
  publicationStatuses: ["Draft"],
  dateDisplay: "Date display",
  userRoles: ["User role"],
  dataverse: "main",
  dataverseServerUrl: "Server URL",
}
