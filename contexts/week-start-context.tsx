"use client"

import {
  createContext,
  useContext,
  useSyncExternalStore,
  useCallback,
  ReactNode,
} from "react"

export type WeekStartDay = "sunday" | "monday"

interface WeekStartContextType {
  weekStart: WeekStartDay
  setWeekStart: (day: WeekStartDay) => void
}

const STORAGE_KEY = "focusbeacon-week-start"
const DEFAULT_WEEK_START: WeekStartDay = "monday"

export const WeekStartContext = createContext<WeekStartContextType>({
  weekStart: DEFAULT_WEEK_START,
  setWeekStart: () => {},
})

// Subscribers for useSyncExternalStore
let listeners: Array<() => void> = []

function subscribe(callback: () => void) {
  listeners = [...listeners, callback]
  return () => {
    listeners = listeners.filter((l) => l !== callback)
  }
}

function emitChange() {
  for (const listener of listeners) {
    listener()
  }
}

function getSnapshot(): WeekStartDay {
  const stored = localStorage.getItem(STORAGE_KEY)
  if (stored === "sunday" || stored === "monday") {
    return stored
  }
  return DEFAULT_WEEK_START
}

function getServerSnapshot(): WeekStartDay {
  return DEFAULT_WEEK_START
}

export function WeekStartProvider({ children }: { children: ReactNode }) {
  // useSyncExternalStore handles SSR correctly:
  // - Server: uses getServerSnapshot (returns default)
  // - Client: uses getSnapshot (reads localStorage immediately)
  const weekStart = useSyncExternalStore(
    subscribe,
    getSnapshot,
    getServerSnapshot
  )

  const setWeekStart = useCallback((day: WeekStartDay) => {
    localStorage.setItem(STORAGE_KEY, day)
    emitChange()
  }, [])

  return (
    <WeekStartContext.Provider value={{ weekStart, setWeekStart }}>
      {children}
    </WeekStartContext.Provider>
  )
}

export function useWeekStart() {
  return useContext(WeekStartContext)
}
