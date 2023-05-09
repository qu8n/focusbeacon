export function createYTDChartData(yearToDateData) {
  const completedSessions = yearToDateData.filter(
    (session) => session.users[0].completed === true
  );

  const months = [
    "Jan",
    "Feb",
    "Mar",
    "Apr",
    "May",
    "Jun",
    "Jul",
    "Aug",
    "Sept",
    "Nov",
    "Dec"
  ];

  const chartDataShell = months.reduce((acc, month) => {
    acc[month] = { month };
    acc[month]["Total sessions"] = 0;
    return acc;
  }, {});

  const chartData = completedSessions.reduce((acc, session) => {
    const month = new Date(session.startTime).toLocaleDateString("en-us", {
      month: "short"
    });
    acc[month]["Total sessions"] += 1;
    return acc;
  }, chartDataShell);

  return Object.values(chartData);
}
