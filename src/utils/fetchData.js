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
    // Splitting into two requests per year to avoid the API's error:
    // 'Date range must be smaller than one year' for select accounts when using the full year range
    // ?start=${year}-01-01T00:00:00Z&end=${year}-12-31T23:59:59Z`
    const response1 = await fetch(
      `https://api.focusmate.com/v1/sessions?start=${year}-01-01T00:00:00Z&end=${year}-06-30T23:59:59Z`,
      requestOptions(headers)
    );
    const result1 = await response1.json();
    sessionsData = [...sessionsData, ...result1.sessions];

    const response2 = await fetch(
      `https://api.focusmate.com/v1/sessions?start=${year}-07-01T00:00:00Z&end=${year}-12-31T23:59:59Z`,
      requestOptions(headers)
    );
    const result2 = await response2.json();
    sessionsData = [...sessionsData, ...result2.sessions];
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
