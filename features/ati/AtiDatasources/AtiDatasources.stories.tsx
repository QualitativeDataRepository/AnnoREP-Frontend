import { Story, Meta } from "@storybook/react"

import AtiDatasources, { AtiDatasourcesProps } from "."

export default {
  component: AtiDatasources,
  title: "ATI/ATI Datasources",
} as Meta

const Template: Story<AtiDatasourcesProps> = (args) => <AtiDatasources {...args} />

export const Default = Template.bind({})
Default.args = {
  atiProject: "ATI Project",
  datasources: [
    {
      id: "datasource-1",
      name: "Datasource 1",
      uri: "Uri 1",
    },
    {
      id: "datasource-2",
      name: "Datasource 2",
      uri: "Uri 2",
    },
    {
      id: "datasource-3",
      name: "Datasource 3",
      uri: "Uri 3",
    },
    {
      id: "datasource-4",
      name: "Datasource 4",
      uri: "Uri 4",
    },
  ],
}
