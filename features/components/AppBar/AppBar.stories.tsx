import { Story, Meta } from "@storybook/react"

import AppBar, { AppBarProps } from "."

export default {
  component: AppBar,
  title: "Component/App Bar",
} as Meta

const Template: Story<AppBarProps> = (args) => <AppBar {...args} />

export const Default = Template.bind({})
Default.args = {
  isLoggedIn: true,
}
