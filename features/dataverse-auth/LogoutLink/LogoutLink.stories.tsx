import { Story, Meta } from "@storybook/react"

import LogoutLink, { LogoutLinkProps } from "."

export default {
  component: LogoutLink,
  title: "Dataverse Auth/Logout Link",
} as Meta

const Template: Story<LogoutLinkProps> = (args) => <LogoutLink {...args} />

export const Default = Template.bind({})
