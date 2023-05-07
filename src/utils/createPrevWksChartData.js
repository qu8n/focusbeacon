export function createPrevWksChartData(data) {
  const chartDataShell = getSundaysOfPrevWeeks().reduce((acc, weekOfDate) => {
    acc[weekOfDate] = { weekOfDate };
    acc[weekOfDate]["25 minutes"] = 0;
    acc[weekOfDate]["50 minutes"] = 0;
    acc[weekOfDate]["75 minutes"] = 0;
    return acc;
  }, {});

  const chartData = data.reduce((acc, session) => {
    const weekOfDate = getWeekOfDateOfDate(new Date(session.startTime));
    const duration = session.duration / 60000; // ms to minutes
    if (duration === 25) {
      acc[weekOfDate]["25 minutes"] += 1;
    } else if (duration === 50) {
      acc[weekOfDate]["50 minutes"] += 1;
    } else {
      acc[weekOfDate]["75 minutes"] += 1;
    }
    return acc;
  }, chartDataShell);

  return Object.values(chartData).sort((a, b) => {
    return new Date(a.weekOfDate) - new Date(b.weekOfDate);
  });
}

function getWeekOfDateOfDate(date) {
  const sunday = new Date(date);
  sunday.setDate(date.getDate() - date.getDay());
  return formatDateAsMMMD(sunday);
}

function formatDateAsMMMD(date) {
  return date.toLocaleDateString("en-US", { month: "short", day: "numeric" });
}

function getSundaysOfPrevWeeks() {
  let today = new Date();
  let dayOfWeek = today.getDay();
  let daysSinceLastSunday = (dayOfWeek + 7 - 0) % 7;
  today.setDate(today.getDate() - daysSinceLastSunday);

  const sundays = [];
  for (let i = 1; i <= 4; i++) {
    let prevSunday = new Date(today);
    prevSunday.setDate(today.getDate() - 7 * i);
    sundays.push(formatDateAsMMMD(prevSunday));
  }

  return sundays;
}
