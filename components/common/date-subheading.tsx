import { Strong, Text } from "@/components/ui/text"
import { Skeleton } from "../ui/skeleton"

export function DateSubheading({
  title,
  dateRange,
  className,
}: {
  title: string
  dateRange: string
  className?: string
}) {
  return (
    <div className={className}>
      <Strong className="text-base">{title}</Strong>

      <div className="relative flex items-center gap-3">
        {dateRange ? (
          <Text>{dateRange}</Text>
        ) : (
          <Skeleton className="h-[24px] w-[210px]" />
        )}

        {/* Horizontal line */}
        <div className="flex-grow border-t border-stone-300 border-dashed" />
      </div>
    </div>
  )
}
