export function getFormattedDate(date: Date | string) {
  let dateObj
  if (typeof date === "string") {
    // The API sends dates that are already local calendar days ("2024-03-10").
    // new Date() reads a date-only string as UTC midnight, which then formats
    // as the day before for anyone behind UTC, so build it from the parts
    const [year, month, day] = date.split("-").map(Number)
    dateObj = new Date(year, month - 1, day)
  } else {
    dateObj = date
  }
  return dateObj.toLocaleDateString("en-us", {
    year: "numeric",
    month: "long",
    day: "numeric",
  })
}
