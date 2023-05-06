export function createCurrWkChartData(data) {
  const weekDays = [
    "Sunday",
    "Monday",
    "Tuesday",
    "Wednesday",
    "Thursday",
    "Friday",
    "Saturday"
  ];

  // Initialize an obj of objs for each week day with 0 sessions and hours
  const chartDataShell = weekDays.reduce((acc, weekDay) => {
    acc[weekDay] = { weekDay };
    acc[weekDay]["Total sessions"] = 0;
    acc[weekDay]["Total hours of sessions"] = 0;
    return acc;
  }, {});

  // Add up the sessions and hours for each week day
  const chartData = data.reduce((acc, session) => {
    const weekDay = weekDays[new Date(session.startTime).getDay()]; // 0 = Sunday, 1 = Monday, etc.
    acc[weekDay]["Total sessions"] += 1;
    acc[weekDay]["Total hours of sessions"] += session.duration / 3600000;
    return acc;
  }, chartDataShell);

  // Convert the obj of objs to an array of objs to be compatible with Tremor's chart component
  return Object.values(chartData);
}
