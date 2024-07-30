"use client"

import { QueryClient, QueryClientProvider } from "@tanstack/react-query"
import { createContext, useState } from "react"
import { DevModeButton } from "@/components/common/dev-mode-button"
import { useSearchParams } from "next/navigation"

const queryClient = new QueryClient()
export const DevModeContext = createContext(false)
export const DemoModeContext = createContext(false)

export const Providers = ({ children }: { children: React.ReactNode }) => {
  const [devMode, setDevMode] = useState(false)
  const searchParams = useSearchParams()
  const demoMode = searchParams.get("demo") === "true"

  return (
    <DemoModeContext.Provider value={demoMode}>
      <DevModeContext.Provider value={devMode}>
        <QueryClientProvider client={queryClient}>
          {children}

          {process.env.NODE_ENV === "development" && (
            <DevModeButton devMode={devMode} setDevMode={setDevMode} />
          )}
        </QueryClientProvider>
      </DevModeContext.Provider>
    </DemoModeContext.Provider>
  )
}
