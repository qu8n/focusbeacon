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
      {children}
    </StackedLayout>
  )
}
