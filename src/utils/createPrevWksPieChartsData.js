export function createPrevWksPieChartsData(prevWeeksData) {
  const completedSessions = prevWeeksData.filter(
    (session) => session.users[0].completed === true
  );

  // Create a "shell" to hold data for charting
  const durations = ["25 minutes", "50 minutes", "75 minutes"];
  const chartDataShell = durations.reduce((acc, duration) => {
    acc[duration] = { duration };
    acc[duration].sessions = 0;
    return acc;
  }, {});

  // Fill in the shell with data & convert it to an array to work with Tremor's charts
  const sessionsChartDataObj = completedSessions.reduce((acc, session) => {
    const duration = session.duration / 60000; // ms to minutes
    acc[`${duration} minutes`].sessions += 1;
    return acc;
  }, chartDataShell);
  const sessionsPieChartData = Object.values(sessionsChartDataObj);

  return { sessionsPieChartData };
}
