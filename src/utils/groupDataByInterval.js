/* Example given data:
[
    {
        "sessionId": "ab4f5102-528d-41e3-898d-75c329039cd4",
        "duration": 3000000,
        "startTime": "2021-04-30T01:15:00+00:00",
        "users": [
            {
                "userId": "542a6b89-bbb8-41f9-a2c4-802654e57a9c",
                "requestedAt": "2021-04-30T01:13:51.366795+00:00",
                "joinedAt": "2021-04-30T01:14:38.327763+00:00",
                "completed": true,
                "sessionTitle": ""
            },
            {
                "userId": "e37498da-62fa-4caa-b68f-41b7c444d23a"
            }
        ]
    },
    ...
]
*/

/* Example data for chart:
[
    {
        "Week of": "Feb 5",
        "Number of Sessions": 12
    },
    {
        "Week of": "Feb 12",
        "Number of Sessions": 12
    },
    ...
]
*/

export function groupDataByInterval(sessionsData) {
  const today = new Date();

  const mondayCurrWeek = getMondayCurrWeek(today);
  const currWeekData = sessionsData.filter(
    (session) => new Date(session.startTime) >= mondayCurrWeek
  );

  // Get sessions data 4 weeks ago, excluding current week
  const sundayWeeksAgo = getMondayWeeksAgo(today, 4);
  const prevWeeksData = sessionsData.filter(
    (session) =>
      new Date(session.startTime) >= sundayWeeksAgo &&
      new Date(session.startTime) < mondayCurrWeek
  );

  console.log("currWeekData", currWeekData);
  console.log("prevWeeksData", prevWeeksData);

  return { currWeekData, prevWeeksData };
}

function getMondayWeeksAgo(today, weeksAgo) {
  const daysToSubtract =
    (today.getDay() === 0 ? 6 : today.getDay() - 1) + weeksAgo * 7;
  const mondayWeeksAgo = new Date(today);
  return mondayWeeksAgo.setDate(today.getDate() - daysToSubtract);
}

function getMondayCurrWeek(today) {
  const daysToSubtract = today.getDay() === 0 ? 6 : today.getDay() - 1;
  const mondayCurrWeek = new Date(today);
  return mondayCurrWeek.setDate(today.getDate() - daysToSubtract);
}
