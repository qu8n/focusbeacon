export function createPrevWksChartData(prevWeeksData, today) {
  const completedSessions = prevWeeksData.filter(
    (session) => session.users[0].completed === true
  );

  // Create a "shell" to hold data for charting
  const chartDataShell = getMondaysOfPrevWeeks(today).reduce(
    (acc, weekOfDate) => {
      acc[weekOfDate] = { weekOfDate };
      acc[weekOfDate]["25 minutes"] = 0;
      acc[weekOfDate]["50 minutes"] = 0;
      acc[weekOfDate]["75 minutes"] = 0;
      return acc;
    },
    {}
  );

  // Fill in the shell with data, convert it to an array to work with Tremor's charts, and sort it by date
  const weeklySessionsChartDataObj = completedSessions.reduce(
    (acc, session) => {
      const weekOfDate = getWeekOfDateOfDate(new Date(session.startTime));
      const duration = session.duration / 60000; // ms to minutes
      acc[weekOfDate][`${duration} minutes`] += 1;
      return acc;
    },
    structuredClone(chartDataShell)
  );
  const weeklySessionsChartData = Object.values(
    weeklySessionsChartDataObj
  ).sort((a, b) => {
    return new Date(a.weekOfDate) - new Date(b.weekOfDate);
  });

  const weeklyHoursChartDataObj = completedSessions.reduce((acc, session) => {
    const weekOfDate = getWeekOfDateOfDate(new Date(session.startTime));
    const duration = session.duration / 60000; // ms to minutes
    acc[weekOfDate][`${duration} minutes`] += duration / 60;
    return acc;
  }, structuredClone(chartDataShell));
  const weeklyHoursChartData = Object.values(weeklyHoursChartDataObj).sort(
    (a, b) => {
      return new Date(a.weekOfDate) - new Date(b.weekOfDate);
    }
  );

  return [weeklySessionsChartData, weeklyHoursChartData];
}

function getWeekOfDateOfDate(date) {
  const daysToSubtract = date.getDay() === 0 ? 6 : date.getDay() - 1;
  const monday = new Date(date);
  monday.setDate(date.getDate() - daysToSubtract);
  return formatDateAsMMMD(monday);
}

function formatDateAsMMMD(date) {
  return date.toLocaleDateString("en-US", { month: "short", day: "numeric" });
}

function getMondaysOfPrevWeeks(today) {
  let dayOfWeek = today.getDay();
  let daysSinceLastMonday = (dayOfWeek + 7 - 1) % 7;
  today.setDate(today.getDate() - daysSinceLastMonday);

  const mondays = [];
  for (let i = 1; i <= 4; i++) {
    let prevMonday = new Date(today);
    prevMonday.setDate(today.getDate() - 7 * i);
    mondays.push(formatDateAsMMMD(prevMonday));
  }

  return mondays;
}
