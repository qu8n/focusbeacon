import DashboardTabs from "@/components/dashboard-tabs"
import { ReactQueryClientProvider } from "@/components/react-query-provider"

export default function DashboardLayout({
  children,
}: {
  children: React.ReactNode
}) {
  return (
    <section>
      <DashboardTabs />
      <ReactQueryClientProvider>{children}</ReactQueryClientProvider>
    </section>
  )
}
