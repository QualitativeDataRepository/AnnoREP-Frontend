import { Story, Meta } from "@storybook/react"

import NewAtiProjectForm, { NewAtiProjectFormProps } from "."

export default {
  component: NewAtiProjectForm,
  title: "ATI/New ATI Project Form",
} as Meta

const Template: Story<NewAtiProjectFormProps> = (args) => <NewAtiProjectForm {...args} />

export const WithDatasets = Template.bind({})
WithDatasets.args = {
  datasets: [
    {
      id: "dataset-1",
      name: "Dataset 1",
    },
    {
      id: "dataset-2",
      name: "Dataset 2",
    },
    {
      id: "dataset-3",
      name: "Dataset 3",
    },
    {
      id: "dataset-3",
      name: "Dataset 4",
    },
  ],
  serverUrl: "https://test.com",
  initialTotalCount: 4,
  datasetsPerPage: 10,
}

export const WithoutDatasets = Template.bind({})
WithoutDatasets.args = {
  datasets: [],
  serverUrl: "https://test.com",
  initialTotalCount: 0,
  datasetsPerPage: 10,
}

export const WithShowMoreDatasets = Template.bind({})
WithShowMoreDatasets.args = {
  datasets: [
    {
      id: "dataset-1",
      name: "Dataset 1",
    },
  ],
  serverUrl: "https://test.com",
  initialTotalCount: 2,
  datasetsPerPage: 1,
}
