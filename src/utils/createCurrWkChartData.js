export function createCurrWkChartData(currWeekData) {
  const completedSessions = currWeekData.filter(
    (session) => session.users[0].completed === true
  );

  const weekDays = [
    "Monday",
    "Tuesday",
    "Wednesday",
    "Thursday",
    "Friday",
    "Saturday",
    "Sunday"
  ];

  // Initialize an obj of objs for each week day with 0 sessions and hours
  const chartDataShell = weekDays.reduce((acc, weekDay) => {
    acc[weekDay] = { weekDay };
    acc[weekDay]["Total sessions"] = 0;
    return acc;
  }, {});

  // Add up the sessions and hours for each week day
  const chartData = completedSessions.reduce((acc, session) => {
    const dayOfWeek = new Date(session.startTime);
    const weekDay =
      weekDays[dayOfWeek.getDay() === 0 ? 6 : dayOfWeek.getDay() - 1];
    acc[weekDay]["Total sessions"] += 1;
    return acc;
  }, chartDataShell);

  // Convert the obj of objs to an array of objs to be compatible with Tremor's chart component
  return Object.values(chartData);
}
