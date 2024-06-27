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
import PageTitle from "@/components/page-title"
import { Logo } from "@/components/logo"
import { Footnote } from "@/components/text"
import { LinkInternal } from "@/components/link-internal"
import { LinkExternal } from "@/components/link-external"
import { RiExternalLinkLine } from "@remixicon/react"
import { NavbarClient } from "@/components/navbar-client"
import { Providers } from "@/components/providers"

export const metadata = {
  title: "FocusBeacon — Focusmate session metrics dashboard",
  description:
    "Track your session statistics and stay motivated toward your goals. FocusBeacon is a free and unofficial dashboard for all Focusmate users.",
}

const navItems = [
  {
    label: "Home",
    url: "/",
  },
  {
    label: "About",
    url: "/about",
  },
  {
    label: "Privacy",
    url: "/privacy",
  },
  {
    label: "Contact",
    url: "https://forms.gle/D7k33QwMUzK2m1vb7",
  },
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
            footer={
              <>
                <Footnote>© FocusBeacon</Footnote>
                <div className="flex flex-col sm:flex-row gap-4">
                  {navItems.map(({ label, url }) => {
                    if (url[0] === "/") {
                      return (
                        <LinkInternal key={label} href={url}>
                          <Footnote key={label}>{label}</Footnote>
                        </LinkInternal>
                      )
                    } else {
                      return (
                        <LinkExternal
                          key={label}
                          href={url}
                          openInNewTab
                          className="flex flex-row items-center gap-1"
                        >
                          <RiExternalLinkLine className="size-3" color="gray" />
                          <Footnote key={label}>{label}</Footnote>
                        </LinkExternal>
                      )
                    }
                  })}
                </div>
              </>
            }
          >
            <PageTitle />
            {children}
          </StackedLayout>
        </Providers>
      </body>
    </html>
  )
}
