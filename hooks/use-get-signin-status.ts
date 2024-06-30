import { useQuery } from "@tanstack/react-query"

export function useGetSigninStatus(queryKey: string[]) {
  const { isLoading, isSuccess: isSignedIn } = useQuery({
    queryKey: queryKey,
    queryFn: async () => {
      const response = await fetch(`/api/signin-status`)
      if (!response.ok) throw Error
      return response.status
    },
    staleTime: Infinity, // never refetch
    retry: false,
  })

  return { isLoading, isSignedIn }
}
