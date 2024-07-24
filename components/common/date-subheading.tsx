import { Strong, Text } from "@/components/ui/text"

export function DateSubheading({
  title,
  dateRange,
  className,
}: {
  title: string
  dateRange: string | React.ReactNode
  className?: string
}) {
  return (
    <div className={className}>
      <Strong className="text-base">{title}</Strong>

      <div className="relative flex items-center">
        <div className="flex-shrink mr-4">
          {typeof dateRange === "string" || dateRange instanceof String ? (
            <Text>{dateRange}</Text>
          ) : (
            dateRange
          )}
        </div>

        {/* Horizontal line */}
        <div className="flex-grow border-t border-stone-300 border-dashed" />
      </div>
    </div>
  )
}
