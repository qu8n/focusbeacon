export function currWeekDateRange() {
  const today = new Date();

  const firstDayOfWeek = new Date(today);
  firstDayOfWeek.setDate(today.getDate() - today.getDay());

  const lastDayOfWeek = new Date(today);
  lastDayOfWeek.setDate(today.getDate() + (6 - today.getDay()));

  return formatDateRange(firstDayOfWeek, lastDayOfWeek);
}

export function prevWeeksDateRange() {
  const today = new Date();

  const firstDayOfCurrentWeek = new Date(today);
  firstDayOfCurrentWeek.setDate(today.getDate() - today.getDay());

  const firstDayWeeksAgo = new Date(firstDayOfCurrentWeek);
  firstDayWeeksAgo.setDate(firstDayOfCurrentWeek.getDate() - 4 * 7);

  const lastDayWeeksAgo = new Date(firstDayOfCurrentWeek);
  lastDayWeeksAgo.setDate(firstDayOfCurrentWeek.getDate() - 1);

  return formatDateRange(firstDayWeeksAgo, lastDayWeeksAgo);
}

function formatDateRange(firstDay, lastDay) {
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
