import { Story, Meta } from "@storybook/react"

import UploadManuscriptModal, { UploadManuscriptModalProps } from "."

export default {
  component: UploadManuscriptModal,
  title: "ATI/Upload Manuscript Modal",
} as Meta

const Template: Story<UploadManuscriptModalProps> = (args) => <UploadManuscriptModal {...args} />

export const Default = Template.bind({})
Default.args = {
  open: true,
  manuscriptName: "Manuscript name",
  uploadAnnotations: true,
}
