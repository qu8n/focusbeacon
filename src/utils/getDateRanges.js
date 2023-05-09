export function currYearDateRange() {
  const today = new Date();

  const firstDayOfYear = new Date(today.getFullYear(), 0);
  const lastDayOfYear = new Date(today.getFullYear() + 1, 0, 0);

  return formatMonthlyDateRange(firstDayOfYear, lastDayOfYear);
}

export function prevMonthsDateRange() {
  const today = new Date();

  const firstDayOfCurrentMonth = new Date(
    today.getFullYear(),
    today.getMonth(),
    1
  );

  const firstDayMonthsAgo = new Date(firstDayOfCurrentMonth);
  firstDayMonthsAgo.setMonth(firstDayOfCurrentMonth.getMonth() - 6);

  const lastDayMonthsAgo = new Date(firstDayOfCurrentMonth);
  lastDayMonthsAgo.setDate(firstDayOfCurrentMonth.getDate() - 1);

  return formatMonthlyDateRange(firstDayMonthsAgo, lastDayMonthsAgo);
}

export function currMonthDateRange() {
  const today = new Date();

  const firstDayOfMonth = new Date(today.getFullYear(), today.getMonth(), 1);
  const lastDayOfMonth = new Date(today.getFullYear(), today.getMonth() + 1, 0);

  return formatMonthlyDateRange(firstDayOfMonth, lastDayOfMonth);
}

export function currWeekDateRange() {
  const today = new Date();

  const firstDayOfWeek = new Date(today);
  firstDayOfWeek.setDate(
    today.getDate() - (today.getDay() === 0 ? 6 : today.getDay() - 1)
  );

  const lastDayOfWeek = new Date(today);
  lastDayOfWeek.setDate(
    today.getDate() + (6 - (today.getDay() === 0 ? 6 : today.getDay() - 1))
  );

  return formatWeeklyDateRange(firstDayOfWeek, lastDayOfWeek);
}

export function prevWeeksDateRange() {
  const today = new Date();

  const firstDayOfCurrentWeek = new Date(today);
  firstDayOfCurrentWeek.setDate(
    today.getDate() - (today.getDay() === 0 ? 6 : today.getDay() - 1)
  );

  const firstDayWeeksAgo = new Date(firstDayOfCurrentWeek);
  firstDayWeeksAgo.setDate(firstDayOfCurrentWeek.getDate() - 4 * 7);

  const lastDayWeeksAgo = new Date(firstDayOfCurrentWeek);
  lastDayWeeksAgo.setDate(firstDayOfCurrentWeek.getDate() - 1);

  return formatWeeklyDateRange(firstDayWeeksAgo, lastDayWeeksAgo);
}

function formatWeeklyDateRange(firstDay, lastDay) {
  const options = {
    weekday: "long",
    year: "numeric",
    month: "long",
    day: "numeric"
  };

  return (
    firstDay.toLocaleDateString("en-US", options) +
    " - " +
    lastDay.toLocaleDateString("en-US", options)
  );
}

function formatMonthlyDateRange(firstDay, lastDay) {
  const options = {
    year: "numeric",
    month: "long",
    day: "numeric"
  };

  return (
    firstDay.toLocaleDateString("en-US", options) +
    " - " +
    lastDay.toLocaleDateString("en-US", options)
  );
}
