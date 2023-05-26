export function createPrevYChartData(prevYearData) {
  const completedSessions = prevYearData.filter(
    (session) => session.users[0].completed === true
  );

  // Create a "shell" to hold data for charting
  const chartDataShell = getPrevYearMonths().reduce((acc, month) => {
    acc[month] = { month };
    acc[month]["25 minutes"] = 0;
    acc[month]["50 minutes"] = 0;
    acc[month]["75 minutes"] = 0;
    return acc;
  }, {});

  // Fill in the shell with data, convert it to an array to work with Tremor's charts, and sort it by date
  const yearlySessionsChartDataObj = completedSessions.reduce(
    (acc, session) => {
      const month = getMonthOfDate(new Date(session.startTime));
      const duration = session.duration / 60000; // ms to minutes
      acc[month][`${duration} minutes`] += 1;
      return acc;
    },
    structuredClone(chartDataShell)
  );
  const yearlySessionsChartData = Object.values(
    yearlySessionsChartDataObj
  ).sort((a, b) => {
    return new Date(a.month) - new Date(b.month);
  });

  const yearlyHoursChartDataObj = completedSessions.reduce((acc, session) => {
    const month = getMonthOfDate(new Date(session.startTime));
    const duration = session.duration / 60000; // ms to minutes
    acc[month][`${duration} minutes`] += duration / 60;
    return acc;
  }, structuredClone(chartDataShell));
  const yearlyHoursChartData = Object.values(yearlyHoursChartDataObj).sort(
    (a, b) => {
      return new Date(a.month) - new Date(b.month);
    }
  );

  return [yearlySessionsChartData, yearlyHoursChartData];
}

// TODO: remove this useless func
function getMonthOfDate(date) {
  return formatDateAsMMMYYYY(date);
}

function formatDateAsMMMYYYY(date) {
  return date.toLocaleDateString("en-US", { month: "short", year: "numeric" });
}

function getPrevYearMonths() {
  const now = new Date();
  const prevYearStart = new Date(now.getFullYear() - 1, 0, 1);
  const prevYearMonths = [];
  for (let i = 0; i < 12; i++) {
    const month = new Date(prevYearStart);
    month.setMonth(prevYearStart.getMonth() + i);
    prevYearMonths.push(formatDateAsMMMYYYY(month));
  }
  return prevYearMonths;
}
