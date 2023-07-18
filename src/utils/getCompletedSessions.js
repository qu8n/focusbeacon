export function getCompletedSessions(rawData) {
  return rawData.filter(
    (session) => session.users[0].completed === true
  );
}