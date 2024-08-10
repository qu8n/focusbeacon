"use client"

import { QueryClient, QueryClientProvider } from "@tanstack/react-query"
import { createContext, Suspense } from "react"
import { useSearchParams } from "next/navigation"
import { useGetSigninStatus } from "@/hooks/use-get-signin-status"

const queryClient = new QueryClient()
export const DemoModeContext = createContext(false)
export const SignInStatusContext = createContext({
  isCheckingSignInStatus: true,
  isSignedIn: false,
})

export function Providers({ children }: { children: React.ReactNode }) {
  return (
    <QueryClientProvider client={queryClient}>
      <Suspense>
        <CustomProviders>{children}</CustomProviders>
      </Suspense>
    </QueryClientProvider>
  )
}

/**
 * We're using another layer of providers to enable the use of React Query
 */
function CustomProviders({ children }: { children: React.ReactNode }) {
  const { isCheckingSignInStatus, isSignedIn } = useGetSigninStatus()
  const searchParams = useSearchParams()
  const demoMode = searchParams.get("demo") === "true"

  return (
    <SignInStatusContext.Provider
      value={{ isCheckingSignInStatus, isSignedIn }}
    >
      <DemoModeContext.Provider value={demoMode}>
        {children}
      </DemoModeContext.Provider>
    </SignInStatusContext.Provider>
  )
}
