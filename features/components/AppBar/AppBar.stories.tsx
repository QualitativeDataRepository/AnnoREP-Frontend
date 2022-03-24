import { Story, Meta } from "@storybook/react"

import AppBar, { AppBarProps } from "."

export default {
  component: AppBar,
  title: "Component/App Bar",
} as Meta

const Template: Story<AppBarProps> = (args) => <AppBar {...args} />

export const Default = Template.bind({})
Default.args = {
  user: {
    dataverse: {
      name: "Test @ QDR",
      link: "test.com",
    },
    hypothesis: {
      name: "Test @ Hypothes.is",
      link: "test.com",
    },
  },
}
