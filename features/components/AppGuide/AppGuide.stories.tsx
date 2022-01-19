import { Story, Meta } from "@storybook/react"

import AppGuide, { AppGuideProps } from "."

export default {
  component: AppGuide,
  title: "Component/App Guide",
} as Meta

const Template: Story<AppGuideProps> = (args) => <AppGuide {...args} />

export const Default = Template.bind({})
Default.args = {}
