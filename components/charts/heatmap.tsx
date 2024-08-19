import { CalendarData, ResponsiveTimeRange } from "@nivo/calendar"
import { Strong, Text } from "@/components/ui/text"
import { getFormattedDate } from "@/lib/date"
import { Divider } from "@/components/ui/divider"
import { useBreakpoint } from "@/hooks/use-breakpoint"

const svgSizeReduction = 0.05

function DaySvg({ color }: { color: string }) {
  return (
    <svg
      width={300 * svgSizeReduction}
      height={170 * svgSizeReduction}
      xmlns="http://www.w3.org/2000/svg"
    >
      <rect
        width={150 * svgSizeReduction}
        height={150 * svgSizeReduction}
        x={10 * svgSizeReduction}
        y={10 * svgSizeReduction}
        rx={30 * svgSizeReduction}
        ry={30 * svgSizeReduction}
        fill={color}
      />
    </svg>
  )
}

export function Heatmap({
  data,
}: {
  data: {
    data: CalendarData["data"]
    from: CalendarData["from"]
    to: CalendarData["to"]
    past_year_sessions: number
  }
}) {
  const { isBelowSm } = useBreakpoint("sm")
  return (
    // A parent container with height is required for a Nivo Responsive
    // component to know how much space it should occupy
    <div className={isBelowSm ? "overflow-x-auto" : ""}>
      <div className="h-[155px] w-[780px]">
        <ResponsiveTimeRange
          data={data.data}
          from={data.from}
          to={data.to}
          direction={"horizontal"}
          firstWeekday="monday"
          weekdayTicks={[0, 2, 4, 6]}
          weekdayLegendOffset={60}
          monthLegend={(_year: number, _month: number, date: Date) => {
            // Manually get the month and year because Nivo can't infer
            // these values automatically from our data
            return date.toLocaleString("default", {
              month: "short",
              year: "2-digit",
            })
          }}
          monthLegendOffset={20}
          emptyColor="#EBEDF0"
          colors={["#ffedd5", "#fdba74", "#f97316"]}
          margin={{ top: 50, right: 20, bottom: 0, left: 0 }}
          dayBorderWidth={3}
          dayBorderColor="#ffffff"
          dayRadius={4}
          tooltip={({ day, value, color }) => {
            // Can't directly call new Date(day) because day is already in
            // local time (Date assumes UTC time)
            const [y, m, d] = day.split("-").map(Number)
            const date = new Date(y, m - 1, d) // month is 0-indexed

            return (
              <div className="py-2 bg-[#FDFDFA] border rounded-md shadow-sm z-50">
                <Text className="px-4">
                  <Strong>{getFormattedDate(date)}</Strong>
                </Text>
                <Divider className="my-2" />
                <div className="flex px-4 items-center">
                  <DaySvg color={color} />
                  <Text>
                    {value} session{Number(value) !== 1 && "s"}
                  </Text>
                </div>
              </div>
            )
          }}
        />
      </div>
    </div>
  )
}
