import { CalendarData, ResponsiveTimeRange } from "@nivo/calendar"
import { Strong, Text } from "./text"
import { Divider } from "./divider"
import { getFormattedDate } from "@/lib/date"

const svgSizeReduction = 0.08

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
  title,
  data,
  isBelowSm,
}: {
  title: string
  data: {
    data: CalendarData["data"]
    from: CalendarData["from"]
    to: CalendarData["to"]
    past_year_sessions: number
  }
  isBelowSm: boolean
}) {
  return (
    // A parent container with height is required for a Nivo Responsive
    // component to know how much space it should occupy
    <div>
      <div className="mb-2">
        <Text className="flex flex-col mt-6 mb-3">
          <Strong>{title}</Strong>
          <span>
            {data.past_year_sessions.toLocaleString()} sessions in the last year
          </span>
        </Text>

        <div
          style={isBelowSm ? { height: 1600 } : { height: 200 }}
          className={isBelowSm ? "block sm:hidden" : "hidden sm:block"}
        >
          <ResponsiveTimeRange
            data={data.data}
            from={data.from}
            direction={isBelowSm ? "vertical" : "horizontal"}
            to={data.to}
            firstWeekday="monday"
            weekdayTicks={[0, 2, 4]}
            weekdayLegendOffset={isBelowSm ? 0 : 60}
            monthLegend={(_year: number, _month: number, date: Date) => {
              // Manually get the month and year because Nivo can't infer
              // these values automatically from our data
              const month = date.toLocaleString("default", { month: "short" })
              const year = date.getFullYear() % 100
              return `${month}-${year}`
            }}
            monthLegendOffset={20}
            emptyColor="#EBEDF0"
            colors={["#ffedd5", "#fdba74", "#f97316"]}
            margin={
              isBelowSm
                ? { top: 60, right: 0, bottom: 80, left: 40 }
                : { top: 50, right: 20, bottom: 0, left: 0 }
            }
            dayBorderWidth={3}
            dayBorderColor="#ffffff"
            dayRadius={4}
            tooltip={({ day, value, color }) => {
              // Can't directly call new Date(day) because day is already in
              // local time (Date assumes UTC time)
              const [y, m, d] = day.split("-").map(Number)
              const date = new Date(y, m - 1, d) // month is 0-indexed

              return (
                <div className="p-4 bg-white border rounded-md shadow-sm">
                  <Text>
                    <Strong>{getFormattedDate(date)}</Strong>
                  </Text>
                  <div className="flex items-center">
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

      <Divider />
    </div>
  )
}
