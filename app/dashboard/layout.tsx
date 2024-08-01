"use client"

import { DashboardTabs } from "@/components/common/dashboard-tabs"
import { Skeleton } from "@/components/ui/skeleton"
import { useProtectRoute } from "@/hooks/use-protect-route"

export default function DashboardLayout({
  children,
}: {
  children: React.ReactNode
}) {
  const { demoMode, isCheckingSignInStatus, isSignedIn } = useProtectRoute()

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
