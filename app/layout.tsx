import { cx } from "@/lib/utils"
import "./globals.css"
import { GeistSans } from "geist/font/sans"
import { StackedLayout } from "@/components/stacked-layout"
import {
  Navbar,
  NavbarItem,
  NavbarSection,
  NavbarSpacer,
} from "@/components/navbar"
import { Avatar } from "@/components/avatar"
import {
  Sidebar,
  SidebarBody,
  SidebarHeader,
  SidebarItem,
  SidebarSection,
} from "@/components/sidebar"
import PageTitle from "@/components/page-title"
import { Link } from "@/components/link"

export const metadata = {
  title: "FocusBeacon — Focusmate session metrics dashboard (unofficial)",
  description:
    "FocusBeacon unlocks insights into your Focusmate sessions, helping you track your progress and stay motivated.",
}

const navItems = [
  { label: "Dashboard", url: "/dashboard" },
  { label: "About", url: "/about" },
  { label: "Privacy", url: "/privacy" },
  { label: "FAQ", url: "/faq" },
  { label: "Sign In", url: "#" },
]

export default function RootLayout({
  children,
}: {
  children: React.ReactNode
}) {
  return (
    <html
      lang="en"
      className={cx(GeistSans.className, "antialiased bg-zinc-100")}
    >
      <body>
        <StackedLayout
          navbar={
            <Navbar className="max-w-4xl mx-auto">
              <NavbarItem className="max-sm:hidden">
                <Avatar src="/images/icon-192.png" />
                <Link href="/">FocusBeacon</Link>
              </NavbarItem>

              <NavbarSpacer />

              <NavbarSection className="max-sm:hidden">
                {navItems.map(({ label, url }) => (
                  <NavbarItem
                    prefetch={label !== "Dashboard"}
                    key={label}
                    href={url}
                  >
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
                  <Link href="/">FocusBeacon</Link>
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
          <PageTitle />
          {children}
        </StackedLayout>
      </body>
    </html>
  )
}
