import { Story, Meta } from "@storybook/react"

import AppDesc from "."

export default {
  component: AppDesc,
  title: "Component/App Desc",
} as Meta

const Template: Story = (args) => <AppDesc {...args} />

export const Default = Template.bind({})
