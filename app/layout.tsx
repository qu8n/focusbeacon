import { cx } from "@/lib/utils"
import "./globals.css"
import { GeistSans } from "geist/font/sans"
import { StackedLayout } from "@/components/common/stacked-layout"
import {
  Navbar,
  NavbarItem,
  NavbarSection,
  NavbarSpacer,
} from "@/components/ui/navbar"
import { PageTitle } from "@/components/common/page-title"
import { Logo } from "@/components/ui/logo"
import { NavbarClient } from "@/components/common/navbar-client"
import { Providers } from "@/components/common/providers"
import { Metadata } from "next"
import { Footer } from "@/components/common/footer"

export const metadata: Metadata = {
  title: "FocusBeacon — Focusmate session metrics dashboard",
  description:
    "Track your session statistics and stay motivated toward your goals. FocusBeacon is a free and unofficial dashboard for all Focusmate users.",
}

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
        <Providers>
          <StackedLayout
            navbar={
              <Navbar className="max-w-4xl mx-auto">
                <NavbarItem>
                  <Logo />
                </NavbarItem>

                <NavbarSpacer />

                <NavbarSection>
                  <NavbarClient />
                </NavbarSection>
              </Navbar>
            }
            footer={<Footer />}
          >
            <PageTitle />
            {children}
          </StackedLayout>
        </Providers>
      </body>
    </html>
  )
}
