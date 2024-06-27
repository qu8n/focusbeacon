import DashboardTabs from "@/components/dashboard-tabs"

export default function DashboardLayout({
  children,
}: {
  children: React.ReactNode
}) {
  return (
    <section className="flex flex-col gap-9">
      <DashboardTabs />
      {children}
    </section>
  )
}
