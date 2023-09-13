// TODO: Make these functions more DRY

export function createCurrWkChartData(currWeekData) {
  const completedSessions = currWeekData.filter(
    (session) => session.users[0].completed === true
  );

  const weekDays = [
    "Monday",
    "Tuesday",
    "Wednesday",
    "Thursday",
    "Friday",
    "Saturday",
    "Sunday"
  ];

  // Initialize an obj of objs for each week day with 0 sessions and hours
  const chartDataShell = weekDays.reduce((acc, weekDay) => {
    acc[weekDay] = { weekDay };
    acc[weekDay]["Total sessions"] = 0;
    return acc;
  }, {});

  // Add up the sessions and hours for each week day
  const chartData = completedSessions.reduce((acc, session) => {
    const dayOfWeek = new Date(session.startTime);
    const weekDay =
      weekDays[dayOfWeek.getDay() === 0 ? 6 : dayOfWeek.getDay() - 1];
    acc[weekDay]["Total sessions"] += 1;
    return acc;
  }, chartDataShell);

  // Convert the obj of objs to an array of objs to be compatible with Tremor's chart component
  return Object.values(chartData);
}

export function createPrevWksChartData(prevWeeksData, today) {
  const completedSessions = prevWeeksData.filter(
    (session) => session.users[0].completed === true
  );

  // Create a "shell" to hold data for charting
  const chartDataShell = getMondaysOfPrevWeeks(today).reduce(
    (acc, weekOfDate) => {
      acc[weekOfDate] = { weekOfDate };
      acc[weekOfDate]["25 minutes"] = 0;
      acc[weekOfDate]["50 minutes"] = 0;
      acc[weekOfDate]["75 minutes"] = 0;
      return acc;
    },
    {}
  );

  // Fill in the shell with data, convert it to an array to work with Tremor's charts, and sort it by date
  const weeklySessionsChartDataObj = completedSessions.reduce(
    (acc, session) => {
      const weekOfDate = getWeekOfDateOfDate(new Date(session.startTime));
      const duration = session.duration / 60000; // ms to minutes
      acc[weekOfDate][`${duration} minutes`] += 1;
      return acc;
    },
    structuredClone(chartDataShell)
  );
  const weeklySessionsChartData = Object.values(
    weeklySessionsChartDataObj
  ).sort((a, b) => {
    return new Date(a.weekOfDate) - new Date(b.weekOfDate);
  });

  const weeklyHoursChartDataObj = completedSessions.reduce((acc, session) => {
    const weekOfDate = getWeekOfDateOfDate(new Date(session.startTime));
    const duration = session.duration / 60000; // ms to minutes
    acc[weekOfDate][`${duration} minutes`] += duration / 60;
    return acc;
  }, structuredClone(chartDataShell));
  const weeklyHoursChartData = Object.values(weeklyHoursChartDataObj).sort(
    (a, b) => {
      return new Date(a.weekOfDate) - new Date(b.weekOfDate);
    }
  );

  return [weeklySessionsChartData, weeklyHoursChartData];
}

function getWeekOfDateOfDate(date) {
  const daysToSubtract = date.getDay() === 0 ? 6 : date.getDay() - 1;
  const monday = new Date(date);
  monday.setDate(date.getDate() - daysToSubtract);
  return formatDateAsMMMD(monday);
}

function formatDateAsMMMD(date) {
  return date.toLocaleDateString("en-US", { month: "short", day: "numeric" });
}

function getMondaysOfPrevWeeks(today) {
  let dayOfWeek = today.getDay();
  let daysSinceLastMonday = (dayOfWeek + 7 - 1) % 7;
  today.setDate(today.getDate() - daysSinceLastMonday);

  const mondays = [];
  for (let i = 1; i <= 4; i++) {
    let prevMonday = new Date(today);
    prevMonday.setDate(today.getDate() - 7 * i);
    mondays.push(formatDateAsMMMD(prevMonday));
  }

  return mondays;
}

export function createCurrMChartData(currMonthData, today) {
  const completedSessions = currMonthData.filter(
    (session) => session.users[0].completed === true
  );

  const lastDayCurrMonth = new Date(
    today.getFullYear(),
    today.getMonth() + 1,
    0
  ).getDate();

  const datesThisMonth = [];
  for (let i = 1; i <= lastDayCurrMonth; i++) {
    datesThisMonth.push(i);
  }

  const chartDataShell = datesThisMonth.reduce((acc, date) => {
    acc[date] = { date };
    acc[date]["Total sessions"] = 0;
    return acc;
  }, {});

  const chartData = completedSessions.reduce((acc, session) => {
    const date = new Date(session.startTime).getDate();
    acc[date]["Total sessions"] += 1;
    return acc;
  }, chartDataShell);

  return Object.values(chartData);
}

export function createPrevMsChartData(prevMonthsData, today) {
  const completedSessions = prevMonthsData.filter(
    (session) => session.users[0].completed === true
  );

  // Create a "shell" to hold data for charting
  const chartDataShell = getPrevMonths(today).reduce((acc, month) => {
    acc[month] = { month };
    acc[month]["25 minutes"] = 0;
    acc[month]["50 minutes"] = 0;
    acc[month]["75 minutes"] = 0;
    return acc;
  }, {});

  // Fill in the shell with data, convert it to an array to work with Tremor's charts, and sort it by date
  const monthlySessionsChartDataObj = completedSessions.reduce(
    (acc, session) => {
      const month = formatDateAsMMMYYYY(new Date(session.startTime));
      const duration = session.duration / 60000; // ms to minutes
      acc[month][`${duration} minutes`] += 1;
      return acc;
    },
    structuredClone(chartDataShell)
  );
  const monthlySessionsChartData = Object.values(
    monthlySessionsChartDataObj
  ).sort((a, b) => {
    return new Date(a.month) - new Date(b.month);
  });

  const monthlyHoursChartDataObj = completedSessions.reduce((acc, session) => {
    const month = formatDateAsMMMYYYY(new Date(session.startTime));
    const duration = session.duration / 60000; // ms to minutes
    acc[month][`${duration} minutes`] += duration / 60;
    return acc;
  }, structuredClone(chartDataShell));
  const monthlyHoursChartData = Object.values(monthlyHoursChartDataObj).sort(
    (a, b) => {
      return new Date(a.month) - new Date(b.month);
    }
  );

  return [monthlySessionsChartData, monthlyHoursChartData];
}

function formatDateAsMMMYYYY(date) {
  return date.toLocaleDateString("en-US", { month: "short", year: "numeric" });
}

function getPrevMonths(today) {
  const prevMonths = [];
  for (let i = 6; i > 0; i--) {
    const month = new Date(today.getFullYear(), today.getMonth(), 1);
    month.setMonth(month.getMonth() - i);
    prevMonths.push(formatDateAsMMMYYYY(month));
  }
  return prevMonths;
}

export function createYTDChartData(yearToDateData) {
  const completedSessions = yearToDateData.filter(
    (session) => session.users[0].completed === true
  );

  const months = [
    "Jan",
    "Feb",
    "Mar",
    "Apr",
    "May",
    "Jun",
    "Jul",
    "Aug",
    "Sep",
    "Nov",
    "Dec"
  ];

  const chartDataShell = months.reduce((acc, month) => {
    acc[month] = { month };
    acc[month]["Total sessions"] = 0;
    return acc;
  }, {});

  const chartData = completedSessions.reduce((acc, session) => {
    const month = new Date(session.startTime).toLocaleDateString("en-us", {
      month: "short"
    });
    acc[month]["Total sessions"] += 1;
    return acc;
  }, chartDataShell);

  return Object.values(chartData);
}

export function createPrevYChartData(prevYearData, today) {
  const completedSessions = prevYearData.filter(
    (session) => session.users[0].completed === true
  );

  // Create a "shell" to hold data for charting
  const chartDataShell = getPrevYearMonths(today).reduce((acc, month) => {
    acc[month] = { month };
    acc[month]["25 minutes"] = 0;
    acc[month]["50 minutes"] = 0;
    acc[month]["75 minutes"] = 0;
    return acc;
  }, {});

  // Fill in the shell with data, convert it to an array to work with Tremor's charts, and sort it by date
  const yearlySessionsChartDataObj = completedSessions.reduce(
    (acc, session) => {
      const month = formatDateAsMMMYYYY(new Date(session.startTime));
      const duration = session.duration / 60000; // ms to minutes
      acc[month][`${duration} minutes`] += 1;
      return acc;
    },
    structuredClone(chartDataShell)
  );
  const yearlySessionsChartData = Object.values(
    yearlySessionsChartDataObj
  ).sort((a, b) => {
    return new Date(a.month) - new Date(b.month);
  });

  const yearlyHoursChartDataObj = completedSessions.reduce((acc, session) => {
    const month = formatDateAsMMMYYYY(new Date(session.startTime));
    const duration = session.duration / 60000; // ms to minutes
    acc[month][`${duration} minutes`] += duration / 60;
    return acc;
  }, structuredClone(chartDataShell));
  const yearlyHoursChartData = Object.values(yearlyHoursChartDataObj).sort(
    (a, b) => {
      return new Date(a.month) - new Date(b.month);
    }
  );

  return [yearlySessionsChartData, yearlyHoursChartData];
}

function getPrevYearMonths(today) {
  const prevYearStart = new Date(today.getFullYear() - 1, 0, 1);
  const prevYearMonths = [];
  for (let i = 0; i < 12; i++) {
    const month = new Date(prevYearStart);
    month.setMonth(prevYearStart.getMonth() + i);
    prevYearMonths.push(formatDateAsMMMYYYY(month));
  }
  return prevYearMonths;
}
