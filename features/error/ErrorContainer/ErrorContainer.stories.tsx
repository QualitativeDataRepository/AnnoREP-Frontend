import { Story, Meta } from "@storybook/react"

import ErrorContainer, { ErrorContainerProps } from "."

export default {
  component: ErrorContainer,
  title: "Error/Error Container",
} as Meta

const Template: Story<ErrorContainerProps> = (args) => <ErrorContainer {...args} />

export const Default = Template.bind({})
Default.args = {
  error: "Error message",
}
