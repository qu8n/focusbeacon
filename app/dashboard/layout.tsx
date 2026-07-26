"use client"

import { DashboardSkeleton } from "@/components/common/dashboard-skeleton"
import { DashboardTabs } from "@/components/common/dashboard-tabs"
import { DemoCallout } from "@/components/common/demo-callout"
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
