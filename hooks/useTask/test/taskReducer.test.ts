import { ITaskState, taskReducer, TaskActionType } from "../state"

describe("taskReducer", () => {
  const initialState: ITaskState = {
    status: "inactive",
    desc: "",
  }

  test("handles start", () => {
    expect(taskReducer(initialState, { type: TaskActionType.START, payload: "test" })).toEqual({
      ...initialState,
      status: "active",
      desc: "test",
    })
  })

  test("handles next step", () => {
    expect(taskReducer(initialState, { type: TaskActionType.NEXT_STEP, payload: "test" })).toEqual({
      ...initialState,
      desc: "test",
    })
  })

  test("handles finish", () => {
    expect(taskReducer(initialState, { type: TaskActionType.FINISH, payload: "test" })).toEqual({
      ...initialState,
      status: "finished",
      desc: "test",
    })
  })

  test("handles fail", () => {
    expect(taskReducer(initialState, { type: TaskActionType.FAIL, payload: "test" })).toEqual({
      ...initialState,
      status: "error",
      desc: "test",
    })
  })

  test("handles reset", () => {
    expect(taskReducer(initialState, { type: TaskActionType.RESET })).toEqual({
      ...initialState,
      status: "inactive",
      desc: "",
    })
  })
})
