"use client"

import { QueryClient, QueryClientProvider } from "@tanstack/react-query"
import { createContext, Suspense } from "react"
import { useSearchParams } from "next/navigation"
import { useGetSigninStatus } from "@/hooks/use-get-signin-status"
import posthog from "posthog-js"
import { PostHogProvider } from "posthog-js/react"
import { POSTHOG_HOST, POSTHOG_KEY } from "@/lib/config"
import { WeekStartProvider } from "@/contexts/week-start-context"

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
// The key is optional, per .env.example -- a self-hosted or contributor build
// has no PostHog project. Initializing without one does no telemetry and logs
// "PostHog was initialized without a token" to the console on every page load,
// so gate on it rather than calling init unconditionally.
const posthogEnabled =
  typeof window !== "undefined" &&
  process.env.NODE_ENV === "production" &&
  Boolean(POSTHOG_KEY)

if (posthogEnabled) {
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
  const searchParams = useSearchParams()
  const demoMode = searchParams.get("demo") === "true"
  const { isCheckingSignInStatus, isSignedIn } = useGetSigninStatus(!demoMode)

  const content = (
    <SignInStatusContext.Provider
      value={{ isCheckingSignInStatus, isSignedIn }}
    >
      <DemoModeContext.Provider value={demoMode}>
        <WeekStartProvider>
          {children}
        </WeekStartProvider>
      </DemoModeContext.Provider>
    </SignInStatusContext.Provider>
  )

  // Keyed off the same condition as init above, so the provider is never
  // wrapped around an uninitialized client
  return posthogEnabled ? (
    <PostHogProvider client={posthog}>{content}</PostHogProvider>
  ) : (
    content
  )
}
