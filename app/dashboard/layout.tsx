import { Avatar } from "@/components/avatar"
import { StackedLayout } from "@/components/stacked-layout"
import {
  Navbar,
  NavbarItem,
  NavbarLabel,
  NavbarSection,
  NavbarSpacer,
} from "@/components/navbar"
import {
  Sidebar,
  SidebarBody,
  SidebarHeader,
  SidebarItem,
  SidebarLabel,
  SidebarSection,
} from "@/components/sidebar"
import { ReactQueryClientProvider } from "@/components/react-query-provider"
import { Heading } from "@/components/heading"
import { Button } from "@/components/button"

const navItems = [
  { label: "About", url: "/" },
  { label: "Privacy", url: "/" },
  { label: "Report Issues", url: "/" },
  { label: "Sign In", url: "/" },
]

export default function DashboardLayout({
  children,
}: {
  children: React.ReactNode
}) {
  return (
    <StackedLayout
      navbar={
        <Navbar>
          <NavbarItem className="max-sm:hidden">
            <Avatar src="/images/icon-192.png" />
            <NavbarLabel>FocusBeacon</NavbarLabel>
          </NavbarItem>

          <NavbarSpacer />

          <NavbarSection className="max-sm:hidden">
            {navItems.map(({ label, url }) => (
              <NavbarItem key={label} href={url}>
                {label}
              </NavbarItem>
            ))}
          </NavbarSection>
        </Navbar>
      }
      sidebar={
        <Sidebar>
          <SidebarHeader>
            <SidebarItem>
              <Avatar src="/images/icon-192.png" />
              <SidebarLabel>FocusBeacon</SidebarLabel>
            </SidebarItem>
          </SidebarHeader>

          <SidebarBody>
            <SidebarSection>
              {navItems.map(({ label, url }) => (
                <SidebarItem key={label} href={url}>
                  {label}
                </SidebarItem>
              ))}
            </SidebarSection>
          </SidebarBody>
        </Sidebar>
      }
    >
      <div className="flex items-end justify-between w-full gap-4 pb-6 border-b border-zinc-950/10 dark:border-white/10">
        <Heading>Streak</Heading>
        <div className="flex gap-4">
          <Button>Streak</Button>
          <Button outline>Weekly</Button>
        </div>
      </div>

      <ReactQueryClientProvider>{children}</ReactQueryClientProvider>
    </StackedLayout>
  )
}
