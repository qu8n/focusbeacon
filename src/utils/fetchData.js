export async function fetchProfileData(headers) {
  const response = await fetch(
    `https://api.focusmate.com/v1/me`,
    requestOptions(headers)
  );

  return response.json();
}

export async function fetchSessionsData(headers, memberSince) {
  const currentYear = new Date().getFullYear();
  const firstYear = new Date(memberSince).getFullYear();
  let rawSessionsData = [];

  // One year of data per request per API's limit
  for (let year = currentYear; year >= firstYear; year--) {
    const response = await fetch(
      `https://api.focusmate.com/v1/sessions?start=${year}-01-01T12:00:00Z&end=${year}-12-31T12:00:00Z`,
      requestOptions(headers)
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

function requestOptions(headers) {
  return {
    method: "GET",
    headers: headers,
    redirect: "follow"
  };
}
