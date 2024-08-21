"use client"

import { QueryClient, QueryClientProvider } from "@tanstack/react-query"
import { createContext, Suspense } from "react"
import { useSearchParams } from "next/navigation"
import { useGetSigninStatus } from "@/hooks/use-get-signin-status"
import posthog from "posthog-js"
import { PostHogProvider } from "posthog-js/react"
import { POSTHOG_HOST, POSTHOG_KEY } from "@/lib/config"

const queryClient = new QueryClient()

export function Providers({ children }: { children: React.ReactNode }) {
  return (
    <QueryClientProvider client={queryClient}>
      <Suspense>
        <CustomProviders>{children}</CustomProviders>
      </Suspense>
    </QueryClientProvider>
  )
}

export const DemoModeContext = createContext(false)
export const SignInStatusContext = createContext({
  isCheckingSignInStatus: true,
  isSignedIn: false,
})
if (typeof window !== "undefined" && process.env.NODE_ENV === "production") {
  posthog.init(POSTHOG_KEY, {
    api_host: POSTHOG_HOST,
    person_profiles: "always", // creates profiles for anon users as well
  })
}

/**
 * We're using another layer of providers so these other providers can
 * access the React Query Client and use the useQuery hook
 */
function CustomProviders({ children }: { children: React.ReactNode }) {
  const { isCheckingSignInStatus, isSignedIn } = useGetSigninStatus()
  const searchParams = useSearchParams()
  const demoMode = searchParams.get("demo") === "true"

  const content = (
    <SignInStatusContext.Provider
      value={{ isCheckingSignInStatus, isSignedIn }}
    >
      <DemoModeContext.Provider value={demoMode}>
        {children}
      </DemoModeContext.Provider>
    </SignInStatusContext.Provider>
  )

  return process.env.NODE_ENV === "production" ? (
    <PostHogProvider client={posthog}>{content}</PostHogProvider>
  ) : (
    content
  )
}
