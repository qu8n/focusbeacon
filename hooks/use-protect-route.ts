import { DemoModeContext } from "@/components/common/providers"
import { useGetSigninStatus } from "@/hooks/use-get-signin-status"
import { useRouter } from "next/navigation"
import { useContext, useEffect } from "react"

export function useProtectRoute() {
  const demoMode = useContext(DemoModeContext)
  const router = useRouter()

  // Re-check the sign-in status instead of getting it from the context
  const { isCheckingSignInStatus, isSignedIn } = useGetSigninStatus()

  useEffect(() => {
    if (router && !demoMode && !isCheckingSignInStatus && !isSignedIn) {
      router.push("/home")
    }
  }, [router, demoMode, isCheckingSignInStatus, isSignedIn])

  return { demoMode, isCheckingSignInStatus, isSignedIn }
}
