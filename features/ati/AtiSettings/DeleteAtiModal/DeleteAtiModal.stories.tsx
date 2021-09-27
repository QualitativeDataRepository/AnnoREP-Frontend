import { Story, Meta } from "@storybook/react"

import DeleteAtiModal, { DeleteAtiModalProps } from "."

export default {
  component: DeleteAtiModal,
  title: "ATI/ATI Settings/Delete ATI Modal",
} as Meta

const Template: Story<DeleteAtiModalProps> = (args) => <DeleteAtiModal {...args} />

export const Default = Template.bind({})
Default.args = {
  open: true,
  atiName: "ATI Project",
}
