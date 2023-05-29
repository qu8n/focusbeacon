export function createPrevMsChartData(prevMonthsData, today) {
  const completedSessions = prevMonthsData.filter(
    (session) => session.users[0].completed === true
  );

  // Create a "shell" to hold data for charting
  const chartDataShell = getPrevMonths(today).reduce((acc, month) => {
    acc[month] = { month };
    acc[month]["25 minutes"] = 0;
    acc[month]["50 minutes"] = 0;
    acc[month]["75 minutes"] = 0;
    return acc;
  }, {});

  // Fill in the shell with data, convert it to an array to work with Tremor's charts, and sort it by date
  const monthlySessionsChartDataObj = completedSessions.reduce(
    (acc, session) => {
      const month = getMonthOfDate(new Date(session.startTime));
      const duration = session.duration / 60000; // ms to minutes
      acc[month][`${duration} minutes`] += 1;
      return acc;
    },
    structuredClone(chartDataShell)
  );
  const monthlySessionsChartData = Object.values(
    monthlySessionsChartDataObj
  ).sort((a, b) => {
    return new Date(a.month) - new Date(b.month);
  });

  const monthlyHoursChartDataObj = completedSessions.reduce((acc, session) => {
    const month = getMonthOfDate(new Date(session.startTime));
    const duration = session.duration / 60000; // ms to minutes
    acc[month][`${duration} minutes`] += duration / 60;
    return acc;
  }, structuredClone(chartDataShell));
  const monthlyHoursChartData = Object.values(monthlyHoursChartDataObj).sort(
    (a, b) => {
      return new Date(a.month) - new Date(b.month);
    }
  );

  return [monthlySessionsChartData, monthlyHoursChartData];
}

function getMonthOfDate(date) {
  return formatDateAsMMMYYYY(date);
}

function formatDateAsMMMYYYY(date) {
  return date.toLocaleDateString("en-US", { month: "short", year: "numeric" });
}

function getPrevMonths(today) {
  const prevMonths = [];
  for (let i = 6; i > 0; i--) {
    const month = new Date(today.getFullYear(), today.getMonth(), 1);
    month.setMonth(month.getMonth() - i);
    prevMonths.push(formatDateAsMMMYYYY(month));
  }
  return prevMonths;
}
