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
      title: "Dataset 1",
    },
    {
      id: "dataset-2",
      title: "Dataset 2",
    },
    {
      id: "dataset-3",
      title: "Dataset 3",
    },
    {
      id: "dataset-3",
      title: "Dataset 4",
    },
  ],
}

export const WithoutDatasets = Template.bind({})
