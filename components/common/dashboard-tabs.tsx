"use client"

import { cx } from "@/lib/utils"
import { motion } from "framer-motion"
import { useRouter, useSelectedLayoutSegment } from "next/navigation"
import { useEffect, useState } from "react"
import { LinkInternal } from "@/components/ui/link-internal"
import { useGetSigninStatus } from "@/hooks/use-get-signin-status"

const tabNames = ["streak", "weekly", "monthly", "yearly", "lifetime"]

export default function DashboardTabs({ className }: { className?: string }) {
  const [currTab, setCurrTab] = useState(useSelectedLayoutSegment())
  const router = useRouter()
  const { isLoading, isSignedIn } = useGetSigninStatus()

  useEffect(() => {
    if (!isLoading && !isSignedIn) {
      router.push("/home")
    }
  }, [isSignedIn, isLoading, router])

  return (
    <div
      className={cx(
        className,
        "shadow-inner mt-6 sm:mt-4 w-fit rounded-md p-2 bg-zinc-200/[0.6] dark:bg-zinc-800 border border-zinc-200"
      )}
    >
      {tabNames.map((tabName) => (
        <div
          key={tabName}
          className={cx(
            "relative transition",
            "inline-flex px-3 py-1 text-sm font-medium",
            "text-zinc-700 dark:text-zinc-400",
            "hover:text-zinc-600 hover:dark:text-zinc-300"
          )}
          style={{
            WebkitTapHighlightColor: "transparent",
          }}
        >
          {currTab === tabName && (
            <motion.span
              layoutId="bubble"
              className="absolute inset-0 z-10 bg-white rounded-md border border-1 border-zinc-300/[0.8] shadow-sm"
              transition={{ type: "spring", bounce: 0.2, duration: 0.6 }}
            />
          )}
          <LinkInternal
            prefetch={false}
            className="capitalize z-20 hover:text-zinc-600"
            href={`/dashboard/${tabName}`}
            onClick={() => setCurrTab(tabName)}
          >
            {tabName}
          </LinkInternal>
        </div>
      ))}
    </div>
  )
}
