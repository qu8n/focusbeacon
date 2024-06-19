import { CalendarData, ResponsiveTimeRange } from "@nivo/calendar"

export function Calendar({
  title,
  data,
  from,
  to,
  isBelowSm,
}: {
  title: string
  data: CalendarData["data"]
  from: CalendarData["from"]
  to: CalendarData["to"]
  isBelowSm: boolean
}) {
  return (
    // A parent container with height is required for a Nivo Responsive
    // component to know how much space it should occupy
    <div>
      <div className="mt-3 mb-6 font-medium sm:mb-0 text-lg/6 sm:text-sm/6">
        {title}
      </div>

      <div
        style={isBelowSm ? { height: 1600 } : { height: 200 }}
        className={isBelowSm ? "block sm:hidden" : "hidden sm:block"}
      >
        <ResponsiveTimeRange
          data={data}
          from={from}
          direction={isBelowSm ? "vertical" : "horizontal"}
          to={to}
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
              : { top: 50, right: 0, bottom: 0, left: 0 }
          }
          dayBorderWidth={5}
          dayBorderColor="#ffffff"
        />
      </div>
    </div>
  )
}
