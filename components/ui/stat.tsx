import { Badge } from "@/components/ui/badge"
import { Strong, Text } from "@/components/ui/text"

export function Stat({
  title,
  children,
  value,
  changeVal,
  changeText,
}: {
  title: string
  children?: React.ReactNode
  value?: string | React.ReactNode
  changeVal?: number
  changeText?: string
}) {
  let changeStr
  let changeBadgeColor: "stone" | "lime" | "pink" | undefined
  if (changeVal?.toString()) {
    changeStr = changeVal > 0 ? `+${changeVal}` : `${changeVal}`
    changeBadgeColor =
      changeVal === 0 ? "stone" : changeVal > 0 ? "lime" : "pink"
  }

  return (
    <div>
      <Text className="mb-3">
        <Strong>{title}</Strong>
      </Text>

      {children}

      <div className="flex flex-row items-center gap-4">
        <div className="font-semibold text-3xl/8 sm:text-2xl/8">{value}</div>

        <div className="text-sm/6 sm:text-xs/6">
          {changeStr && <Badge color={changeBadgeColor}>{changeStr}</Badge>}{" "}
          {changeText && <span className="text-stone-500">{changeText}</span>}
        </div>
      </div>
    </div>
  )
}
