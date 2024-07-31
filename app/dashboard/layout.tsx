"use client"

import { DashboardTabs } from "@/components/common/dashboard-tabs"
import { DemoModeContext } from "@/components/common/providers"
import { Skeleton } from "@/components/ui/skeleton"
import { useGetSigninStatus } from "@/hooks/use-get-signin-status"
import { useRouter } from "next/navigation"
import { useContext, useEffect } from "react"

export default function DashboardLayout({
  children,
}: {
  children: React.ReactNode
}) {
  const router = useRouter()
  const demoMode = useContext(DemoModeContext)
  const { isCheckingSignInStatus, isSignedIn } = useGetSigninStatus()

  useEffect(() => {
    if (router && !demoMode && !isCheckingSignInStatus && !isSignedIn) {
      router.push("/home")
    }
  }, [router, demoMode, isCheckingSignInStatus, isSignedIn])

  if (!demoMode && (isCheckingSignInStatus || !isSignedIn)) {
    return <Skeleton className="h-[45px] w-full" />
  }

  return (
    <section className="flex flex-col gap-9">
      <DashboardTabs />
      {children}
    </section>
  )
}
