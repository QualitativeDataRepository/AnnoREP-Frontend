import { range } from "./arrayUtils"

describe("range", () => {
  test("includes stop and increment by 1", () => {
    const numbers = range(0, 4, 1)
    expect(numbers).toEqual([0, 1, 2, 3, 4])
  })
  test("start and stop are the same", () => {
    const numbers = range(0, 0, 1)
    expect(numbers).toEqual([0])
  })
  test("increments by 2", () => {
    const numbers = range(1, 10, 2)
    expect(numbers).toEqual([1, 3, 5, 7, 9])
  })
  test("doesn't include stop when step overshoots", () => {
    const numbers = range(0, 201, 100)
    expect(numbers).toEqual([0, 100, 200])
  })
  test("doesn't include the next step when step doesn't at least meet stop", () => {
    const numbers = range(0, 199, 100)
    expect(numbers).toEqual([0, 100])
  })
})
