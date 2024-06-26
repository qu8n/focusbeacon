"use client"

import React from "react"
import { Divider } from "@/components/divider"

export function StackedLayout({
  navbar,
  children,
  footer,
}: React.PropsWithChildren<{
  navbar: React.ReactNode
  footer: React.ReactNode
}>) {
  return (
    <div className="relative flex flex-col w-full max-w-4xl mx-auto isolate min-h-svh">
      {/* Navbar */}
      <header className="flex items-center px-4 my-2">{navbar}</header>
      <Divider className="mx-6" />

      {/* Content */}
      <main className="px-8 mt-6 grow">
        <div className="mx-auto">{children}</div>
      </main>

      {/* Footer */}
      <footer className="mx-6 flex flex-col mt-16">
        <Divider />
        <div className="py-8 text-right flex sm:mx-0 sm:flex-row justify-between">
          {footer}
        </div>
      </footer>
    </div>
  )
}
