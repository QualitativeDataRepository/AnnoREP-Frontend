import React from "react"

import { render } from "../testUtils"

import Home from "../../pages/index"

describe("Home page", () => {
  it("contains AnnoREP", () => {
    const { getByText } = render(<Home />, {})
    expect(getByText("AnnoREP")).toBeTruthy()
  })
})
