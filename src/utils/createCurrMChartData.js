export function createCurrMChartData(currMonthData) {
  const completedSessions = currMonthData.filter(
    (session) => session.users[0].completed === true
  );

  const lastDayCurrMonth = new Date(
    new Date().getFullYear(),
    new Date().getMonth() + 1,
    0
  ).getDate();

  const datesThisMonth = [];
  for (let i = 1; i <= lastDayCurrMonth; i++) {
    datesThisMonth.push(i);
  }

  const chartDataShell = datesThisMonth.reduce((acc, date) => {
    acc[date] = { date };
    acc[date]["Total sessions"] = 0;
    return acc;
  }, {});

  const chartData = completedSessions.reduce((acc, session) => {
    const date = new Date(session.startTime).getDate();
    acc[date]["Total sessions"] += 1;
    return acc;
  }, chartDataShell);

  return Object.values(chartData);
}
