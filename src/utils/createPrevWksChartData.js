export function createPrevWksChartData(prevWeeksData) {
  const completedSessions = prevWeeksData.filter(
    (session) => session.users[0].completed === true
  );

  // Create a "shell" to hold data for charting
  const chartDataShell = getSundaysOfPrevWeeks().reduce((acc, weekOfDate) => {
    acc[weekOfDate] = { weekOfDate };
    acc[weekOfDate]["25 minutes"] = 0;
    acc[weekOfDate]["50 minutes"] = 0;
    acc[weekOfDate]["75 minutes"] = 0;
    return acc;
  }, {});

  // Fill in the shell with data, convert it to an array to work with Tremor's charts, and sort it by date
  const sessionsChartDataObj = completedSessions.reduce((acc, session) => {
    const weekOfDate = getWeekOfDateOfDate(new Date(session.startTime));
    const duration = session.duration / 60000; // ms to minutes
    acc[weekOfDate][`${duration} minutes`] += 1;
    return acc;
  }, structuredClone(chartDataShell));
  const sessionsChartData = Object.values(sessionsChartDataObj).sort((a, b) => {
    return new Date(a.weekOfDate) - new Date(b.weekOfDate);
  });

  const hoursChartDataObj = completedSessions.reduce((acc, session) => {
    const weekOfDate = getWeekOfDateOfDate(new Date(session.startTime));
    const duration = session.duration / 60000; // ms to minutes
    acc[weekOfDate][`${duration} minutes`] += duration / 60;
    return acc;
  }, structuredClone(chartDataShell));
  const hoursChartData = Object.values(hoursChartDataObj).sort((a, b) => {
    return new Date(a.weekOfDate) - new Date(b.weekOfDate);
  });

  return { sessionsChartData, hoursChartData };
}

function getWeekOfDateOfDate(date) {
  const sunday = new Date(date);
  sunday.setDate(date.getDate() - date.getDay());
  return formatDateAsMMMD(sunday);
}

function formatDateAsMMMD(date) {
  return date.toLocaleDateString("en-US", { month: "short", day: "numeric" });
}

function getSundaysOfPrevWeeks() {
  let today = new Date();
  let dayOfWeek = today.getDay();
  let daysSinceLastSunday = (dayOfWeek + 7 - 0) % 7;
  today.setDate(today.getDate() - daysSinceLastSunday);

  const sundays = [];
  for (let i = 1; i <= 4; i++) {
    let prevSunday = new Date(today);
    prevSunday.setDate(today.getDate() - 7 * i);
    sundays.push(formatDateAsMMMD(prevSunday));
  }

  return sundays;
}
