import { useQuery } from "@tanstack/react-query"

export function useGetSigninStatus() {
  const { isLoading: isCheckingSignInStatus, isSuccess: isSignedIn } = useQuery(
    {
      queryKey: ["signinStatus"],
      queryFn: async () => {
        const response = await fetch(`/api/signin-status`)
        if (!response.ok) throw Error
        return response.status
      },
      staleTime: Infinity, // never refetch
      retry: false,
    }
  )

  return { isCheckingSignInStatus, isSignedIn }
}
