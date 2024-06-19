import { Badge } from "./badge"
import { Divider } from "./divider"
import { Strong, Text } from "./text"

export function Stat({
  title,
  value,
  change,
}: {
  title: string
  value: string
  change?: string
}) {
  return (
    <div>
      <div className="mb-9">
        <Text className="mt-6 mb-3">
          <Strong>{title}</Strong>
        </Text>

        <div className="mt-3 font-semibold text-3xl/8 sm:text-2xl/8">
          {value}
        </div>

        {change && (
          <div className="mt-3 text-sm/6 sm:text-xs/6">
            <Badge color={change.startsWith("+") ? "lime" : "pink"}>
              {change}
            </Badge>{" "}
            <span className="text-zinc-500">from last week</span>
          </div>
        )}
      </div>
      <Divider />
    </div>
  )
}
