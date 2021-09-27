import { Story, Meta } from "@storybook/react"

import AtiProjects, { AtiProjectsProps } from "."

export default {
  component: AtiProjects,
  decorators: [
    (Story) => (
      <div style={{ display: "grid", gridTemplateColumns: "1fr", rowGap: "24px" }}>
        <Story />
      </div>
    ),
  ],
  title: "ATI/ATI Projects",
} as Meta

const Template: Story<AtiProjectsProps> = (args) => <AtiProjects {...args} />

export const Default = Template.bind({})
Default.args = {
  atiProjects: [
    {
      id: "ati-project-id-1",
      name: "ATI Project Title",
      description: "Test desc",
      dataverseName: "Dataverse name",
      citationHtml: "Citation HTML",
      publicationStatuses: ["Draft", "Unpublished"],
      dateDisplay: "Date display",
      userRoles: ["User role"],
      dataverse: "main",
      dataverseServerUrl: "Server URL",
    },
  ],
  initialTotalCount: 1,
  atisPerPage: 10,
  publicationStatusCount: {
    unpublished_count: 1,
    draft_count: 1,
    published_count: 0,
    in_review_count: 0,
    deaccessioned_count: 0,
  },
  selectedFilters: {
    publication_statuses: ["Draft", "Unpublished"],
  },
}
