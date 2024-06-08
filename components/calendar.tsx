import { CalendarData, ResponsiveTimeRange } from "@nivo/calendar"

export function Calendar({
  data,
  from,
  to,
  height,
}: {
  data: CalendarData["data"]
  from: CalendarData["from"]
  to: CalendarData["to"]
  height: number
}) {
  return (
    // A parent container with height is required for a Nivo Responsive
    // component to know how much space it should occupy
    <div style={{ height: height }}>
      <ResponsiveTimeRange
        data={data}
        from={from}
        direction="horizontal" // TODO: vertical on mobile
        to={to}
        firstWeekday="monday"
        weekdayTicks={[0, 1, 2, 3, 4, 5, 6]}
        emptyColor="#EBEDF0"
        colors={["#ffedd5", "#fdba74", "#f97316"]}
        margin={{ top: 40, right: 40, bottom: 100, left: 40 }}
        dayBorderWidth={5}
        dayBorderColor="#ffffff"
      />
    </div>
  )
}
