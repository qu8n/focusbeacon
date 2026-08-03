import "@testing-library/jest-dom/vitest"

import { cleanup } from "@testing-library/react"
import { afterEach, vi } from "vitest"

// React Testing Library leaves the rendered tree in the document otherwise, so
// the next test's queries can match the previous test's markup
afterEach(() => {
  cleanup()
  vi.clearAllMocks()
})

// jsdom implements neither, and both are reached during a normal render:
// Radix and Headless UI measure elements, and use-breakpoint asks for a media
// query on mount.
global.ResizeObserver = class ResizeObserver {
  observe() {}
  unobserve() {}
  disconnect() {}
}

Object.defineProperty(window, "matchMedia", {
  writable: true,
  value: (query: string) => ({
    matches: false,
    media: query,
    onchange: null,
    addListener: () => {},
    removeListener: () => {},
    addEventListener: () => {},
    removeEventListener: () => {},
    dispatchEvent: () => false,
  }),
})

// Same reason, but only since Headless UI 2.2: it waits on getAnimations() to
// decide when a transition has finished. jsdom has no Web Animations API, so
// Headless UI installs its own stub and warns on every render that reaches
// one. Nothing here asserts on animation, so an empty list is the honest
// answer and it keeps the warning out of the run.
Element.prototype.getAnimations = () => []
