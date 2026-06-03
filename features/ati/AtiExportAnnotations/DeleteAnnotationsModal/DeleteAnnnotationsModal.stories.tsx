import { Story, Meta } from "@storybook/nextjs"

import DeleteAnnotationsModal, { DeleteAnnotationsModalProps } from "."

export default {
  component: DeleteAnnotationsModal,
  title: "ATI/ATI Export annotations/Delete annotations modal",
} as Meta

const Template: Story<DeleteAnnotationsModalProps> = (args) => <DeleteAnnotationsModal {...args} />

export const Default = Template.bind({})
Default.args = {
  open: true,
  manuscriptName: "Manuscript example",
}
