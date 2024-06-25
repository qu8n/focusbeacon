import DashboardTabs from "@/components/dashboard-tabs"
import { ReactQueryClientProvider } from "@/components/react-query-provider"

export default function DashboardLayout({
  children,
}: {
  children: React.ReactNode
}) {
  return (
    <section className="flex flex-col gap-9 sm:gap-6">
      <DashboardTabs />
      <ReactQueryClientProvider>{children}</ReactQueryClientProvider>
    </section>
  )
}
