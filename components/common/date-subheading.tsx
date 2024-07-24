import { Strong, Text } from "@/components/ui/text"

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

      <div className="relative flex items-center">
        <Text className="flex-shrink mr-4">{dateRange}</Text>

        {/* Horizontal line */}
        <div className="flex-grow border-t border-stone-300 border-dashed" />
      </div>
    </div>
  )
}
