import { cx } from "@/lib/utils"
import "./globals.css"
import { Inter } from "next/font/google"

const inter = Inter({ subsets: ["latin"] })

export const metadata = {
  title: "FocusBeacon — Focusmate session metrics dashboard (unofficial)",
  description:
    "FocusBeacon unlocks insights into your Focusmate sessions, helping you track your progress and stay motivated.",
}

export default function RootLayout({
  children,
}: {
  children: React.ReactNode
}) {
  return (
    <html lang="en">
      <body className={cx(inter.className, "bg-zinc-100")}>{children}</body>
    </html>
  )
}
