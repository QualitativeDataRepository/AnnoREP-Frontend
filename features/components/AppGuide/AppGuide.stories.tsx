import { Story, Meta } from "@storybook/nextjs"

import AppGuide, { AppGuideProps } from "."

export default {
  component: AppGuide,
  title: "Getting Started/App Guide",
} as Meta

const Template: Story<AppGuideProps> = (args) => <AppGuide {...args} />

export const Default = Template.bind({})
Default.args = {}
