import { useQuery } from "@tanstack/react-query"

/**
 * `enabled` is how demo mode opts out. Demo views read a static fixture, so
 * this would otherwise be the one call that still wakes the Python function on
 * a demo page load. A result already in the cache is still returned.
 */
export function useGetSigninStatus(enabled = true) {
  const { isLoading: isCheckingSignInStatus, isSuccess: isSignedIn } = useQuery(
    {
      queryKey: ["signinStatus"],
      queryFn: async () => {
        const response = await fetch(`/api/py/signin-status`)
        if (!response.ok) throw Error
        return response.status
      },
      staleTime: Infinity, // never refetch
      retry: false,
      enabled,
    }
  )

  return { isCheckingSignInStatus, isSignedIn }
}
