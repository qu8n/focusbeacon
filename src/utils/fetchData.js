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
  let sessionsData = [];

  // Limit requests to one year of data at a time following API's restriction.
  for (let year = currentYear; year >= firstYear; year--) {
    // End the time range at 12:00:00 because anything above results in an error
    // 'Date range must be smaller than one year'.
    const response = await fetch(
      `https://api.focusmate.com/v1/sessions?start=${year}-01-01T12:00:00Z&end=${year}-12-31T12:00:00Z`,
      requestOptions(headers)
    );
    const result = await response.json();
    sessionsData = [...sessionsData, ...result.sessions];
  }

  return sessionsData;
}

function requestOptions(headers) {
  return {
    method: "GET",
    headers: headers,
    redirect: "follow"
  };
}
