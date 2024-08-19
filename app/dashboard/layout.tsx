"use client"

import { DashboardTabs } from "@/components/common/dashboard-tabs"
import { DemoCallout } from "@/components/common/demo-callout"
import { Skeleton } from "@/components/ui/skeleton"
import { useProtectRoute } from "@/hooks/use-protect-route"
import { ReactNode } from "react"

export default function DashboardLayout({ children }: { children: ReactNode }) {
  const { demoMode, isCheckingSignInStatus, isSignedIn } = useProtectRoute()

  if (!demoMode && (isCheckingSignInStatus || !isSignedIn)) {
    return <DashboardSkeleton />
  }

  return (
    <section className="flex flex-col gap-6">
      <DashboardTabs />
      {demoMode && <DemoCallout />}
      {children}
    </section>
  )
}

export function DashboardSkeleton() {
  return (
    <>
      <Skeleton className="h-[45px] w-[340px] mt-6" />
      <Skeleton className="h-[245px] w-full mt-9" />
      <Skeleton className="h-[245px] w-full mt-6" />
    </>
  )
}
