import type { Meta, StoryObj } from "@storybook/nextjs"

import AppBar from "."

const meta = {
  component: AppBar,
  title: "Component/App Bar",
} satisfies Meta<typeof AppBar>

export default meta

type Story = StoryObj<typeof meta>

export const Default: Story = {
  args: {
    user: {
      dataverse: {
        name: "Test @ QDR",
        link: "test.com",
      },
      hypothesis: {
        name: "Test @ Hypothes.is",
        link: "test.com",
      },
    },
  },
}
