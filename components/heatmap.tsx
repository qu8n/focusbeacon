import { CalendarData, ResponsiveTimeRange } from "@nivo/calendar"
import { Strong, Text } from "./text"
import { Divider } from "./divider"

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
        <Text className="mt-6 mb-3">
          <Strong>{title}</Strong>
          <p>
            {data.past_year_sessions.toLocaleString()} sessions in the last year
          </p>
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
            dayBorderWidth={5}
            dayBorderColor="#ffffff"
          />
        </div>
      </div>

      <Divider />
    </div>
  )
}
