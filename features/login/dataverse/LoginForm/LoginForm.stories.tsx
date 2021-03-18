import { Story, Meta } from "@storybook/react"

import LoginForm, { LoginFormProps } from "."

export default {
  component: LoginForm,
  title: "Login/Dataverse/Login Form",
} as Meta

const Template: Story<LoginFormProps> = (args) => <LoginForm {...args} />

export const Default = Template.bind({})

export const Valid = Template.bind({})
Valid.args = {
  serverUrl: "https://demo.dataverse.org",
  serverUrlIsInvalid: false,
  apiToken: "123",
  apiTokenIsInvalid: false,
}

export const Invalid = Template.bind({})
Invalid.args = {
  serverUrl: "https://demo.dataverse",
  serverUrlIsInvalid: true,
  serverUrlInvalidText: "A valid URL is required.",
  apiToken: "abc",
  apiTokenIsInvalid: true,
  apiTokenInvalidText: "A valid API token is required.",
}
