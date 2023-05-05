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

// Note to self: in the process of reading processData,
// particularly the LTW section
export function groupDataByInterval(sessionsData) {
  const today = new Date();

  const sundayCurrWeek = getSundayCurrWeek(today);
  const sunday12WeeksAgo = getSundayWeeksAgo(today, 12);

  const currWeekData = sessionsData.filter(
    (session) => new Date(session.startTime) >= sundayCurrWeek
  );

  const prev12WeeksData = sessionsData.filter(
    (session) =>
      new Date(session.startTime) >= sunday12WeeksAgo &&
      new Date(session.startTime) < sundayCurrWeek
  );

  return { currWeekData, prev12WeeksData };
}

function getSundayWeeksAgo(today, weeksAgo) {
  const daysToSubtract = today.getDay() + weeksAgo * 7;
  const sundayWeeksAgo = new Date(today);
  return sundayWeeksAgo.setDate(today.getDate() - daysToSubtract);
}

function getSundayCurrWeek(today) {
  const daysToSubtract = today.getDay();
  const sundayCurrWeek = new Date(today);
  return sundayCurrWeek.setDate(today.getDate() - daysToSubtract);
}
