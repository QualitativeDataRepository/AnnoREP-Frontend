import { Story, Meta } from "@storybook/react"

import DeleteManuscriptModal, { DeleteManuscriptModalProps } from "."

export default {
  component: DeleteManuscriptModal,
  title: "ATI/Delete Manuscript Modal",
} as Meta

const Template: Story<DeleteManuscriptModalProps> = (args) => <DeleteManuscriptModal {...args} />

export const Default = Template.bind({})
Default.args = {
  open: true,
  manuscriptName: "Manuscript name",
}
