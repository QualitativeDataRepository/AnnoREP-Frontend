import { Story, Meta } from "@storybook/react"

import HypothesisLoginNotification from "."

export default {
  component: HypothesisLoginNotification,
  title: "Auth/Hypothesis Login Notification",
} as Meta

const Template: Story = (args) => <HypothesisLoginNotification {...args} />

export const Default = Template.bind({})
