import { act, renderHook } from "@testing-library/react"
import { afterEach, beforeEach, describe, expect, it } from "vitest"

import { reducer, useToast } from "@/hooks/use-toast"

type State = ReturnType<typeof reducer>

function toastRow(id: string, overrides = {}) {
  return { id, title: `Toast ${id}`, open: true, ...overrides }
}

function state(...toasts: ReturnType<typeof toastRow>[]): State {
  // eslint-disable-next-line @typescript-eslint/no-explicit-any
  return { toasts } as any
}

describe("the reducer", () => {
  it("adds a toast", () => {
    // eslint-disable-next-line @typescript-eslint/no-explicit-any
    const next = reducer(state(), { type: "ADD_TOAST", toast: toastRow("1") } as any)
    expect(next.toasts).toHaveLength(1)
    expect(next.toasts[0].id).toBe("1")
  })

  it("keeps only the newest toast", () => {
    // TOAST_LIMIT is 1: this app never stacks them
    const next = reducer(
      state(toastRow("1")),
      // eslint-disable-next-line @typescript-eslint/no-explicit-any
      { type: "ADD_TOAST", toast: toastRow("2") } as any
    )
    expect(next.toasts).toHaveLength(1)
    expect(next.toasts[0].id).toBe("2")
  })

  it("updates a toast in place", () => {
    const next = reducer(state(toastRow("1")), {
      type: "UPDATE_TOAST",
      // eslint-disable-next-line @typescript-eslint/no-explicit-any
      toast: { id: "1", title: "Changed" } as any,
    })
    expect(next.toasts[0].title).toBe("Changed")
    expect(next.toasts[0].open).toBe(true)
  })

  it("leaves other toasts alone when updating", () => {
    const next = reducer(state(toastRow("1"), toastRow("2")), {
      type: "UPDATE_TOAST",
      // eslint-disable-next-line @typescript-eslint/no-explicit-any
      toast: { id: "1", title: "Changed" } as any,
    })
    expect(next.toasts[1].title).toBe("Toast 2")
  })

  it("closes a toast on dismiss rather than removing it", () => {
    // The exit animation needs the element to stay mounted
    const next = reducer(state(toastRow("1")), {
      type: "DISMISS_TOAST",
      toastId: "1",
    })
    expect(next.toasts).toHaveLength(1)
    expect(next.toasts[0].open).toBe(false)
  })

  it("dismisses every toast when given no id", () => {
    const next = reducer(state(toastRow("1"), toastRow("2")), {
      type: "DISMISS_TOAST",
    })
    expect(next.toasts.every((toast) => toast.open === false)).toBe(true)
  })

  it("removes a toast by id", () => {
    const next = reducer(state(toastRow("1"), toastRow("2")), {
      type: "REMOVE_TOAST",
      toastId: "1",
    })
    expect(next.toasts.map((toast) => toast.id)).toEqual(["2"])
  })

  it("removes every toast when given no id", () => {
    const next = reducer(state(toastRow("1"), toastRow("2")), {
      type: "REMOVE_TOAST",
    })
    expect(next.toasts).toEqual([])
  })

  it("ignores an unknown id", () => {
    const next = reducer(state(toastRow("1")), {
      type: "REMOVE_TOAST",
      toastId: "nope",
    })
    expect(next.toasts).toHaveLength(1)
  })
})

describe("useToast", () => {
  beforeEach(() => {
    const { result } = renderHook(() => useToast())
    act(() => result.current.dismiss())
  })

  afterEach(() => {
    const { result } = renderHook(() => useToast())
    act(() => result.current.dismiss())
  })

  it("shows a toast", () => {
    const { result } = renderHook(() => useToast())

    act(() => {
      result.current.toast({ description: "Saved" })
    })

    expect(result.current.toasts).toHaveLength(1)
    expect(result.current.toasts[0].description).toBe("Saved")
  })

  it("returns a handle that dismisses it", () => {
    const { result } = renderHook(() => useToast())

    let handle: { dismiss: () => void }
    act(() => {
      handle = result.current.toast({ description: "Saved" })
    })
    act(() => handle.dismiss())

    expect(result.current.toasts[0].open).toBe(false)
  })

  it("returns a handle that updates it", () => {
    const { result } = renderHook(() => useToast())

    // eslint-disable-next-line @typescript-eslint/no-explicit-any
    let handle: { id: string; update: (props: any) => void }
    act(() => {
      handle = result.current.toast({ description: "Saving" })
    })
    act(() => handle.update({ id: handle.id, description: "Saved" }))

    expect(result.current.toasts[0].description).toBe("Saved")
  })

  it("gives each toast a distinct id", () => {
    const { result } = renderHook(() => useToast())

    let first: string
    let second: string
    act(() => {
      first = result.current.toast({ description: "one" }).id
      second = result.current.toast({ description: "two" }).id
    })

    expect(first!).not.toBe(second!)
  })

  it("closes the toast when the component reports it closing", () => {
    // Radix calls onOpenChange(false) on the swipe or the close button
    const { result } = renderHook(() => useToast())

    act(() => {
      result.current.toast({ description: "Saved" })
    })
    act(() => {
      result.current.toasts[0].onOpenChange?.(false)
    })

    expect(result.current.toasts[0].open).toBe(false)
  })

  it("shares state between separate consumers", () => {
    // The provider and the caller that raises a toast are different subtrees
    const raiser = renderHook(() => useToast())
    const viewer = renderHook(() => useToast())

    act(() => {
      raiser.result.current.toast({ description: "Saved" })
    })

    expect(viewer.result.current.toasts).toHaveLength(1)
  })
})
