export function getCurrWkDateRange() {
  const currentDate = new Date();
  const currentDay = currentDate.getDay();

  const firstDayOfWeek = new Date(currentDate);
  firstDayOfWeek.setDate(currentDate.getDate() - currentDay);

  const lastDayOfWeek = new Date(currentDate);
  lastDayOfWeek.setDate(currentDate.getDate() + (6 - currentDay));

  const options = {
    weekday: "long",
    year: "numeric",
    month: "long",
    day: "numeric"
  };

  const firstDayString = firstDayOfWeek.toLocaleDateString("en-US", options);
  const lastDayString = lastDayOfWeek.toLocaleDateString("en-US", options);

  return firstDayString + " - " + lastDayString;
}
