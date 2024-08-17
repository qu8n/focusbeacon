"use client"

import { useEffect } from "react"
import { usePathname } from "next/navigation"

/**
 * Temp patch for Next.js bug
 * See https://github.com/vercel/next.js/issues/45187
 */
export function useScrollToTop() {
  const pathname = usePathname()
  useEffect(() => {
    window.scroll(0, 0)
  }, [pathname])
}

/**
 * For use inside MDX files
 */
export function ScrollToTop() {
  useScrollToTop()
  return null
}
