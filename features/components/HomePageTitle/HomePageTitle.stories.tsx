import { Story, Meta } from "@storybook/react"

import HomePageTitle from "."

export default {
  component: HomePageTitle,
  title: "Component/Home Page Title",
} as Meta

const Template: Story = (args) => <HomePageTitle {...args} />

export const Default = Template.bind({})
