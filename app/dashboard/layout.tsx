"use client"

import { DashboardTabs } from "@/components/common/dashboard-tabs"
import { DemoCallout } from "@/components/common/demo-callout"
import { Skeleton } from "@/components/ui/skeleton"
import { useProtectRoute } from "@/hooks/use-protect-route"

export default function DashboardLayout({
  children,
}: {
  children: React.ReactNode
}) {
  const { demoMode, isCheckingSignInStatus, isSignedIn } = useProtectRoute()

  if (!demoMode && (isCheckingSignInStatus || !isSignedIn)) {
    return (
      <>
        <Skeleton className="h-[45px] w-[340px] mt-6" />
        <Skeleton className="h-[245px] w-full mt-9" />
        <Skeleton className="h-[245px] w-full mt-6" />
      </>
    )
  }

  return (
    <section className="flex flex-col gap-9">
      <DashboardTabs />
      {demoMode && <DemoCallout />}
      <div className="grid grid-cols-1 gap-6 sm:grid-cols-6">{children}</div>
    </section>
  )
}
