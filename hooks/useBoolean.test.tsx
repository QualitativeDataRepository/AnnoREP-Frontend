/* eslint-disable  @typescript-eslint/no-non-null-assertion */

import React from "react"

import { render, act } from "@testing-library/react"

import useBoolean, { IUseBooleanCallbacks } from "./useBoolean"

describe("useBoolean", () => {
  test("has initial value", () => {
    let value: boolean
    const TestComponent: React.FC<{ initialValue: boolean }> = ({ initialValue }) => {
      ;[value] = useBoolean(initialValue)
      return <div />
    }

    render(<TestComponent initialValue={true} />)
    expect(value!).toBe(true)

    render(<TestComponent initialValue={false} />)
    expect(value!).toBe(false)
  })

  test("updates value", () => {
    let value: boolean
    let callbacks: IUseBooleanCallbacks

    const TestComponent: React.FC = () => {
      ;[value, callbacks] = useBoolean(true)
      return <div />
    }

    render(<TestComponent />)
    expect(value!).toBe(true)

    act(() => callbacks.setFalse())
    expect(value!).toBe(false)

    act(() => callbacks.setTrue())
    expect(value!).toBe(true)
  })

  test("toggles value", () => {
    let value: boolean
    let callbacks: IUseBooleanCallbacks

    const TestComponent: React.FC = () => {
      ;[value, callbacks] = useBoolean(true)
      return <div />
    }

    render(<TestComponent />)
    expect(value!).toBe(true)

    act(() => callbacks.toggle())
    expect(value!).toBe(false)

    act(() => callbacks.toggle())
    expect(value!).toBe(true)
  })
})
