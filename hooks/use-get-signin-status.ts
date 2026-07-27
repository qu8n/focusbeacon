import { useQuery } from "@tanstack/react-query"

/**
 * `enabled` is how demo mode opts out. Demo views read a static fixture, so
 * this would otherwise be the one call that still wakes the Python function on
 * a demo page load. A result already in the cache is still returned.
 */
export function useGetSigninStatus(enabled = true) {
  const { isLoading: isCheckingSignInStatus, data } = useQuery({
    queryKey: ["signinStatus"],
    queryFn: async () => {
      // Bounded, because SigninButton stays disabled while this is in flight.
      // Without a ceiling a cold-starting Python function leaves the primary
      // call to action looking dead for as long as it takes.
      const response = await fetch(`/api/py/signin-status`, {
        signal: AbortSignal.timeout(5000),
      })

      // A 4xx is an answer: there is no valid session. A timeout, a dropped
      // connection, or a 5xx is the check failing to finish, which is not the
      // same thing -- treating it as "signed out" bounces a legitimate user
      // off the dashboard, most likely on the very first request after signing
      // in, which is exactly when a cold start is likeliest.
      if (response.status >= 400 && response.status < 500) return false
      if (!response.ok) throw new Error(`signin-status ${response.status}`)
      return true
    },
    staleTime: Infinity, // never refetch
    retry: false,
    enabled,
  })

  return {
    isCheckingSignInStatus,
    isSignedIn: data === true,
    // Settled without an answer: the check timed out, the backend faulted, or
    // demo mode never asked. Callers about to do something the user cannot
    // undo -- navigating them away -- must not read this as signed out.
    isSignInStatusUnknown: !isCheckingSignInStatus && data === undefined,
  }
}
