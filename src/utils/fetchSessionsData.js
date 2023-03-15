import requestOptions from "./requestOptions";

export default async function fetchSessionsData() {
  const currentYear = new Date().getFullYear();
  let rawSessionsData = [];
  // One request for each year because each API call only returns one year of data max
  for (let year = currentYear; year >= 2016; year--) {
      const response = await fetch(
        `https://api.focusmate.com/v1/sessions?start=${year}-01-01T12:00:00Z&end=${year}-12-31T12:00:00Z`,
        requestOptions()
      );
      const result = await response.json();
      rawSessionsData = [...rawSessionsData, ...result.sessions];
  }
  // Exclude incomplete sessions because they're not "counted"
  const completedSessionsData = rawSessionsData.filter(
    (session) => session.users[0].completed === true
  );
  return completedSessionsData;
}