import { Story, Meta } from "@storybook/react"

import LoginForm, { LoginFormProps } from "."

export default {
  component: LoginForm,
  title: "Auth/Login Form",
} as Meta

const Template: Story<LoginFormProps> = (args) => <LoginForm {...args} />

export const Default = Template.bind({})
Default.args = {
  dataverseServerUrl: "https://dv.dev-aws.qdr.org",
  dataverseSiteUrl: "https://dev-aws.qdr.org",
}

export const Valid = Template.bind({})
Valid.args = {
  dataverseServerUrl: "https://dv.dev-aws.qdr.org",
  dataverseSiteUrl: "https://dev-aws.qdr.org",
  dataverseApiToken: "123",
  dataverseApiTokenIsInvalid: false,
  hypothesisApiToken: "123",
  hypothesisApiTokenIsInvalid: false,
}

export const Invalid = Template.bind({})
Invalid.args = {
  dataverseServerUrl: "https://dv.dev-aws.qdr.org",
  dataverseSiteUrl: "https://dev-aws.qdr.org",
  dataverseApiToken: "123",
  dataverseApiTokenIsInvalid: true,
  dataverseApiTokenInvalidText: "A valid QDR API token is required.",
  hypothesisApiToken: "123",
  hypothesisApiTokenIsInvalid: true,
  hypothesisApiTokenInvalidText: "A valid Hypothes.is API token is required.",
}
