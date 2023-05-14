// TODO: DRYifying date calculations, e.g. use calcs from date range functions here
export function groupDataByInterval(sessionsData, today) {
  today.setHours(0, 0, 0, 0); // TODO: make sure hours are accounted for in all filters here
  const currDayOfWeek = today.getDay();
  const currDate = today.getDate();
  const currYear = today.getFullYear();
  const currMonth = today.getMonth();

  const mondayCurrWeek = new Date(today);
  mondayCurrWeek.setDate(
    currDate - (currDayOfWeek === 0 ? 6 : currDayOfWeek - 1)
  );
  const currWeekData = sessionsData.filter(
    (session) => new Date(session.startTime) >= mondayCurrWeek
  );

  const weeksAgo = 4;
  const mondayWeeksAgo = new Date(today);
  mondayWeeksAgo.setDate(
    currDate - ((currDayOfWeek === 0 ? 6 : currDayOfWeek - 1) + weeksAgo * 7)
  );
  const prevWeeksData = sessionsData.filter(
    (session) =>
      new Date(session.startTime) >= mondayWeeksAgo &&
      new Date(session.startTime) < mondayCurrWeek
  );

  const firstDayCurrMonth = new Date(currYear, currMonth, 1, 0, 0, 0, 0);
  const currMonthData = sessionsData.filter(
    (session) => new Date(session.startTime) >= firstDayCurrMonth
  );

  const prevMonthsData = sessionsData.filter(
    (session) =>
      new Date(session.startTime) >=
        new Date(currYear, currMonth - 6, 1, 0, 0, 0, 0) &&
      new Date(session.startTime) < firstDayCurrMonth
  );

  const firstDayCurrYear = new Date(currYear, 0, 1, 0, 0, 0, 0);
  const currYearData = sessionsData.filter(
    (session) => new Date(session.startTime) >= firstDayCurrYear
  );

  const prevYearData = sessionsData.filter(
    (session) =>
      new Date(session.startTime) >= new Date(currYear - 1, 0, 1, 0, 0, 0, 0) &&
      new Date(session.startTime) < firstDayCurrYear
  );

  return {
    currWeekData,
    prevWeeksData,
    currMonthData,
    prevMonthsData,
    currYearData,
    prevYearData
  };
}
