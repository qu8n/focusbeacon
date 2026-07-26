import { LoaderIcon } from "@/components/common/loader-icon"
import { Skeleton } from "@/components/ui/skeleton"
import { Text } from "@/components/ui/text"

export function DashboardSkeleton() {
  return (
    <div className="relative">
      <Skeleton className="h-[45px] sm:w-[340px] w-full mt-6" />
      <Skeleton className="h-[245px] w-full mt-9" />
      <Skeleton className="h-[245px] w-full mt-6" />

      <div className="absolute inset-0 flex items-center justify-center">
        <div className="inline-flex items-center bg-white p-4 rounded shadow-lg">
          <LoaderIcon />
          <Text>Loading your stats</Text>
        </div>
      </div>
    </div>
  )
}
