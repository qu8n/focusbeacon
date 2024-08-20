"use client"

import { cx } from "@/lib/tw-class-merge"
import { motion } from "framer-motion"
import { useSelectedLayoutSegment } from "next/navigation"
import { useContext, useState } from "react"
import { LinkInternal } from "@/components/ui/link-internal"
import { DemoModeContext } from "@/components/common/providers"
import { useBreakpoint } from "@/hooks/use-breakpoint"

const TAB_NAMES = ["streak", "week", "month", "year", "lifetime"]

export function DashboardTabs({ className }: { className?: string }) {
  const [currTab, setCurrTab] = useState(useSelectedLayoutSegment())
  const demoMode = useContext(DemoModeContext)
  const { isBelowSm } = useBreakpoint("sm")

  return (
    <div
      className={cx(
        className,
        isBelowSm ? "overflow-x-auto" : "w-fit",
        "shadow-inner mt-6 rounded-md p-2 bg-[#EAE7DC] border border-stone-200"
      )}
    >
      <div className="flex">
        {TAB_NAMES.map((tabName) => (
          <div
            key={tabName}
            className={cx(
              "relative transition",
              "inline-flex px-3 py-1 text-sm font-medium",
              "text-stone-700",
              "hover:text-stone-600"
            )}
            style={{
              WebkitTapHighlightColor: "transparent",
            }}
          >
            {currTab === tabName && (
              <motion.span
                layoutId="bubble"
                className="absolute inset-0 z-10 bg-[#FDFDFA] rounded-md border border-1 border-stone-300/[0.7] shadow-sm"
                transition={{ type: "spring", bounce: 0.2, duration: 0.6 }}
              />
            )}
            <LinkInternal
              prefetch={false}
              className="capitalize z-20 hover:text-stone-600"
              href={`/dashboard/${tabName}${demoMode ? "?demo=true" : ""}`}
              onClick={() => setCurrTab(tabName)}
            >
              {tabName}
            </LinkInternal>
          </div>
        ))}
      </div>
    </div>
  )
}
