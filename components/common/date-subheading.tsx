import { Strong, Text } from "@/components/ui/text"
import { Skeleton } from "@/components/ui/skeleton"
import { Button } from "../ui/button"
import { RiCameraLine } from "@remixicon/react"
import { InfoPopover } from "./info-popover"
import { useBreakpoint } from "@/hooks/use-breakpoint"
import { cx } from "@/lib/tw-class-merge"

export function DashboardSubheading({
  title,
  dateRange,
  takeScreenshot,
  popoverContent,
  extraControls,
}: {
  title: string
  dateRange: string | undefined | null
  takeScreenshot?: () => void
  popoverContent?: string
  extraControls?: React.ReactNode
}) {
  const { isAboveSm } = useBreakpoint("sm")

  return (
    <div className="sm:col-span-6">
      <div className="flex flex-row items-center justify-between">
        <Strong className="text-base">{title}</Strong>

        <div className="flex flex-row gap-1 items-center">
          {extraControls}

          {isAboveSm && takeScreenshot && popoverContent && (
            <>
              <Button
                outline
                onClick={takeScreenshot}
                disabled={dateRange === undefined}
              >
                <RiCameraLine size={16} />
              </Button>

              <InfoPopover>{popoverContent}</InfoPopover>
            </>
          )}
        </div>
      </div>

      <div className="relative flex items-center gap-3">
        {dateRange === undefined ? (
          <Skeleton className="h-[24px] w-[210px]" />
        ) : dateRange === null ? null : (
          <Text>{dateRange}</Text>
        )}

        {/* Horizontal line */}
        <div
          className={cx(
            "sm:block hidden flex-grow border-t border-stone-300 border-dashed",
            dateRange === null && "mt-3"
          )}
        />
      </div>
    </div>
  )
}
