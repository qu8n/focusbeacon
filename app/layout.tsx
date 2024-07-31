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
import { Logo } from "@/components/common/logo"
import { NavbarClient } from "@/components/common/navbar-client"
import { Providers } from "@/components/common/providers"
import { Metadata } from "next"
import { Footer } from "@/components/common/footer"
import manifest from "@/app/manifest"

export const metadata: Metadata = {
  title:
    "Focusbeacon — Focusmate statistics & productivity dashboard (Unofficial)",
  description: manifest().description,
}

export default function RootLayout({
  children,
}: {
  children: React.ReactNode
}) {
  return (
    <html
      lang="en"
      className={cx(GeistSans.className, "antialiased bg-[#F3F1EB]")}
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

                <NavbarSection className="mr-4">
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
