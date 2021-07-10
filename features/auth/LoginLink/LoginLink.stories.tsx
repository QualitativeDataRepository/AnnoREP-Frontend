import { Story, Meta } from "@storybook/react"

import LoginLink from "."

export default {
  component: LoginLink,
  title: "Auth/Login Link",
} as Meta

const Template: Story = (args) => <LoginLink {...args} />

export const Default = Template.bind({})
