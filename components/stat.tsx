import { Badge } from "./badge"
import { Divider } from "./divider"

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
        <div className="mt-3 font-medium text-lg/6 sm:text-sm/6">{title}</div>
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
