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
import { Link } from "@/components/link"
import { ExternalLink } from "@/components/external-link"
import { RiExternalLinkLine } from "@remixicon/react"

export const metadata = {
  title: "FocusBeacon — Focusmate session metrics dashboard (unofficial)",
  description:
    "FocusBeacon unlocks insights into your Focusmate sessions, helping you track your progress and stay motivated.",
}

export const navItems = [{ label: "Sign Out", url: "/#" }]

const footerNavItems = [
  {
    label: "Home",
    url: "/",
  },
  {
    label: "Dashboard",
    url: "/dashboard",
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
        <StackedLayout
          navbar={
            <Navbar className="max-w-4xl mx-auto">
              <NavbarItem>
                <Logo />
              </NavbarItem>

              <NavbarSpacer />

              <NavbarSection>
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
          footer={
            <>
              <Footnote>© FocusBeacon</Footnote>
              <div className="flex flex-col sm:flex-row gap-4">
                {footerNavItems.map(({ label, url }) => {
                  if (url[0] === "/") {
                    return (
                      <Link key={label} href={url}>
                        <Footnote key={label}>{label}</Footnote>
                      </Link>
                    )
                  } else {
                    return (
                      <ExternalLink
                        key={label}
                        href={url}
                        openInNewTab
                        className="flex flex-row items-center gap-1"
                      >
                        <RiExternalLinkLine className="size-3" color="gray" />
                        <Footnote key={label}>{label}</Footnote>
                      </ExternalLink>
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
      </body>
    </html>
  )
}
