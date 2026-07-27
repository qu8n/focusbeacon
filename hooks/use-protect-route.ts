import { DemoModeContext } from "@/components/common/providers"
import { useGetSigninStatus } from "@/hooks/use-get-signin-status"
import { useRouter } from "next/navigation"
import { useContext, useEffect } from "react"

export function useProtectRoute() {
  const demoMode = useContext(DemoModeContext)
  const router = useRouter()

  // Re-check the sign-in status instead of getting it from the context
  const { isCheckingSignInStatus, isSignedIn, isSignInStatusUnknown } =
    useGetSigninStatus(!demoMode)

  useEffect(() => {
    // Redirect only on a definite "no session". If the check timed out or the
    // backend faulted we don't know, and throwing a signed-in user out to the
    // marketing page is the worse of the two mistakes.
    if (
      router &&
      !demoMode &&
      !isCheckingSignInStatus &&
      !isSignInStatusUnknown &&
      !isSignedIn
    ) {
      router.push("/home")
    }
  }, [
    router,
    demoMode,
    isCheckingSignInStatus,
    isSignInStatusUnknown,
    isSignedIn,
  ])

  return { demoMode, isCheckingSignInStatus, isSignedIn }
}
