import { Story, Meta } from "@storybook/react"

import AppDesc, { AppDescProps } from "."

export default {
  component: AppDesc,
  title: "Component/App Desc",
} as Meta

const Template: Story<AppDescProps> = (args) => <AppDesc {...args} />

export const Default = Template.bind({})
