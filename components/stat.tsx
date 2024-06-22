import { Badge } from "./badge"
import { Divider } from "./divider"
import { Strong, Text } from "./text"

export function Stat({
  title,
  children,
  value,
  changeVal,
  changeText,
  useNumberSign = false,
}: {
  title: string
  children?: React.ReactNode
  value?: string | React.ReactNode
  changeVal?: number
  changeText?: string
  useNumberSign?: boolean
}) {
  let changeStr = changeVal?.toString()
  let changeBadgeColor: "zinc" | "lime" | "pink" | undefined = "zinc"
  if (changeVal?.toString() && useNumberSign) {
    changeStr = changeVal > 0 ? `+${changeVal}` : `${changeVal}`
    changeBadgeColor =
      changeVal === 0 ? "zinc" : changeVal > 0 ? "lime" : "pink"
  }

  return (
    <div>
      <div className="mt-2 mb-9">
        <Text className="mb-3">
          <Strong>{title}</Strong>
        </Text>

        {children}

        <div className="flex flex-row items-center gap-4">
          <div className="mt-3 font-semibold align-middle text-3xl/8 sm:text-2xl/8">
            {value}
          </div>

          {changeStr && (
            <div className="mt-3 text-sm/6 sm:text-xs/6">
              <Badge color={changeBadgeColor}>{changeStr}</Badge>{" "}
              <span className="text-zinc-500">{changeText}</span>
            </div>
          )}
        </div>
      </div>
      <Divider />
    </div>
  )
}
