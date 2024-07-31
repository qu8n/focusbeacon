"use client"

import { DashboardTabs } from "@/components/common/dashboard-tabs"
import {
  DemoModeContext,
  SignInStatusContext,
} from "@/components/common/providers"
import { Skeleton } from "@/components/ui/skeleton"
import { useRouter } from "next/navigation"
import { useContext, useEffect } from "react"

export default function DashboardLayout({
  children,
}: {
  children: React.ReactNode
}) {
  const router = useRouter()
  const demoMode = useContext(DemoModeContext)
  const { isCheckingSignInStatus, isSignedIn } = useContext(SignInStatusContext)

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
