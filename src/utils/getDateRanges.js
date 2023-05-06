export function currWeekDateRange() {
  const today = new Date();

  const firstDayOfWeek = new Date(today);
  firstDayOfWeek.setDate(today.getDate() - today.getDay());

  const lastDayOfWeek = new Date(today);
  lastDayOfWeek.setDate(today.getDate() + (6 - today.getDay()));

  return formatDateRange(firstDayOfWeek, lastDayOfWeek);
}

export function prev12WeeksDateRange() {
  const today = new Date();

  const firstDayOfCurrentWeek = new Date(today);
  firstDayOfCurrentWeek.setDate(today.getDate() - today.getDay());

  const firstDayOf12WeeksAgo = new Date(firstDayOfCurrentWeek);
  firstDayOf12WeeksAgo.setDate(firstDayOfCurrentWeek.getDate() - 12 * 7);

  const lastDayOf12WeeksAgo = new Date(firstDayOfCurrentWeek);
  lastDayOf12WeeksAgo.setDate(firstDayOfCurrentWeek.getDate() - 1);

  return formatDateRange(firstDayOf12WeeksAgo, lastDayOf12WeeksAgo);
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
