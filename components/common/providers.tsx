"use client"

import { QueryClient, QueryClientProvider } from "@tanstack/react-query"
import { createContext, useState } from "react"
import { DevModeButton } from "@/components/common/dev-mode-button"
import { useSearchParams } from "next/navigation"
import { useGetSigninStatus } from "@/hooks/use-get-signin-status"

const queryClient = new QueryClient()
export const DevModeContext = createContext(false)
export const DemoModeContext = createContext(false)
export const SignInStatusContext = createContext({
  isCheckingSignInStatus: true,
  isSignedIn: false,
})

export function Providers({ children }: { children: React.ReactNode }) {
  return (
    <QueryClientProvider client={queryClient}>
      <CustomProviders>{children}</CustomProviders>
    </QueryClientProvider>
  )
}

/**
 * We're using another layer of providers to enable the use of React Query
 */
function CustomProviders({ children }: { children: React.ReactNode }) {
  const [devMode, setDevMode] = useState(false)
  const { isCheckingSignInStatus, isSignedIn } = useGetSigninStatus()
  const searchParams = useSearchParams()
  const demoMode = searchParams.get("demo") === "true"

  return (
    <SignInStatusContext.Provider
      value={{ isCheckingSignInStatus, isSignedIn }}
    >
      <DemoModeContext.Provider value={demoMode}>
        <DevModeContext.Provider value={devMode}>
          {children}

          {process.env.NODE_ENV === "development" && (
            <DevModeButton devMode={devMode} setDevMode={setDevMode} />
          )}
        </DevModeContext.Provider>
      </DemoModeContext.Provider>
    </SignInStatusContext.Provider>
  )
}
