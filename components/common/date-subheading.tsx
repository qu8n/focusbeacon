import { Strong, Text } from "@/components/ui/text"
import { Skeleton } from "@/components/ui/skeleton"
import { Button } from "../ui/button"
import { RiCameraLine } from "@remixicon/react"
import { InfoPopover } from "./info-popover"
import { useBreakpoint } from "@/hooks/use-breakpoint"

export function DateSubheading({
  title,
  dateRange,
  takeScreenshot,
  popoverContent,
}: {
  title: string
  dateRange: string
  takeScreenshot: () => void
  popoverContent: string
}) {
  const { isAboveSm } = useBreakpoint("sm")

  return (
    <div className="sm:col-span-6">
      <div className="flex flex-row items-center justify-between">
        <Strong className="text-base">{title}</Strong>

        {isAboveSm && (
          <div className="flex flex-row gap-1 items-center">
            <Button outline onClick={takeScreenshot} disabled={!dateRange}>
              <RiCameraLine size={16} />
            </Button>

            <InfoPopover>{popoverContent}</InfoPopover>
          </div>
        )}
      </div>

      <div className="relative flex items-center gap-3">
        {dateRange ? (
          <Text>{dateRange}</Text>
        ) : (
          <Skeleton className="h-[24px] w-[210px]" />
        )}

        {/* Horizontal line */}
        <div className="sm:block hidden flex-grow border-t border-stone-300 border-dashed" />
      </div>
    </div>
  )
}
