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
      <body className={inter.className}>{children}</body>
    </html>
  )
}
