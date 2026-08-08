"use client"

import { ShimmerText } from "@/components/common/shimmer-text"
import { Skeleton } from "@/components/ui/skeleton"
import { ThinkingOrb } from "thinking-orbs"

export function DashboardSkeleton() {
  return (
    <div className="relative">
      <Skeleton className="h-[45px] sm:w-[340px] w-full mt-6" />
      <Skeleton className="h-[245px] w-full mt-9" />
      <Skeleton className="h-[245px] w-full mt-6" />

      <div className="absolute inset-0 flex items-center justify-center">
        <div className="inline-flex items-center gap-2 bg-white px-4 py-3 rounded shadow-lg">
          <ThinkingOrb state="connecting" size={20} theme="light" />
          <ShimmerText>Calculating your stats...</ShimmerText>
        </div>
      </div>
    </div>
  )
}
