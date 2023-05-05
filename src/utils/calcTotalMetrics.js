export function calcTotalMetrics(sessionsData) {
  const completedSessions = sessionsData.filter(
    (session) => session.users[0].completed === true
  );

  const totalSessions = completedSessions.length;
  const totalHours = completedSessions.reduce(
    (total, session) => total + session.duration / 3600000,
    0
  );
  const totalPartners = new Set(
    completedSessions.map((session) => session.users[1].userId)
  ).size;

  return { totalSessions, totalHours, totalPartners };
}
