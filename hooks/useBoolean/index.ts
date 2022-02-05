import { useState } from "react"

export interface IUseBooleanCallbacks {
  setTrue(): void
  setFalse(): void
  toggle(): void
}

function useBoolean(initialValue: boolean): [boolean, IUseBooleanCallbacks] {
  const [value, setValue] = useState<boolean>(initialValue)

  const setTrue = () => setValue(true)
  const setFalse = () => setValue(false)
  const toggle = () => setValue((currentValue) => !currentValue)

  return [value, { setTrue, setFalse, toggle }]
}

export default useBoolean
