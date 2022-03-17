import { Story, Meta } from "@storybook/react"

import DatasourceModal, { DatasourceModalProps } from "."

export default {
  component: DatasourceModal,
  title: "ATI/ATI Manuscript/Datasource Modal",
} as Meta

const Template: Story<DatasourceModalProps> = (args) => <DatasourceModal {...args} />

export const Default = Template.bind({})
Default.args = {
  open: true,
  datasources: [
    {
      id: "datasource-id",
      name: "Datasource",
      uri: "https://datasource-uri.com",
    },
    {
      id: "datasource-id-2",
      name: "Datasourcefffffff-fffffffffff_fffffffffffffffffffffffffffffffffffffffffffffffffffffffffffffffffffffffffffffffffffffffffffffffffffffffffffffff.tab",
      uri: "https://datasource-uri.com",
    },
  ],
  datasetDoi: "dataset-doi",
  serverUrl: "https://test.com",
}
