export function createPrevWksPieChartsData(prevWeeksData) {
  const completedSessions = prevWeeksData.filter(
    (session) => session.users[0].completed === true
  );

  // Create a "shell" to hold data for charting, then fill it in with data
  // and convert it to an array to work with Tremor's charts
  const durationShell = {
    "25 minutes": { duration: "25 minutes", sessions: 0 },
    "50 minutes": { duration: "50 minutes", sessions: 0 },
    "75 minutes": { duration: "75 minutes", sessions: 0 }
  };
  const durationObj = completedSessions.reduce((acc, session) => {
    const duration = session.duration / 60000; // ms to minutes
    acc[`${duration} minutes`].sessions += 1;
    return acc;
  }, durationShell);
  const weeklyDurationPieData = Object.values(durationObj);

  const attendanceShell = {
    "On time": { attendance: "On time", sessions: 0 },
    Late: { attendance: "Late", sessions: 0 }
  };
  const attendanceObj = completedSessions.reduce((acc, session) => {
    const attendance =
      new Date(session.users[0].joinedAt) <= new Date(session.startTime)
        ? "On time"
        : "Late";
    acc[attendance].sessions += 1;
    return acc;
  }, attendanceShell);
  const weeklyAttendancePieData = Object.values(attendanceObj);

  const completionShell = {
    Complete: { completion: "Complete", sessions: 0 },
    Incomplete: { completion: "Incomplete", sessions: 0 }
  };
  const completionObj = prevWeeksData.reduce((acc, session) => {
    const completion =
      session.users[0].completed === true ? "Complete" : "Incomplete";
    acc[completion].sessions += 1;
    return acc;
  }, completionShell);
  const weeklyCompletionPieData = Object.values(completionObj);

  return [
    weeklyDurationPieData,
    weeklyAttendancePieData,
    weeklyCompletionPieData
  ];
}
