function requestOptions(accessToken, isDemo) {
  let headers = new Headers({
    Authorization: `Bearer ${accessToken}`
  });

  if (isDemo) {
    headers = new Headers({
      "X-API-KEY": process.env.FOCUSMATE_API_KEY
    });
  }

  return {
    method: "GET",
    headers: headers,
    redirect: "follow"
  };
}

export async function fetchProfileData(accessToken, isDemo = false) {
  const response = await fetch(
    `https://api.focusmate.com/v1/me`,
    requestOptions(accessToken, isDemo)
  );

  return response.json();
}

export async function fetchSessionsData(
  memberSince,
  accessToken,
  isDemo = false
) {
  const currentYear = new Date().getFullYear();
  const firstYear = new Date(memberSince).getFullYear();
  let rawSessionsData = [];

  // One year of data per request per API's limit
  for (let year = currentYear; year >= firstYear; year--) {
    const response = await fetch(
      `https://api.focusmate.com/v1/sessions?start=${year}-01-01T12:00:00Z&end=${year}-12-31T12:00:00Z`,
      requestOptions(accessToken, isDemo)
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
