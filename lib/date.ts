export function getFormattedDate(date: Date | string) {
  let dateObj
  if (typeof date === "string") {
    dateObj = new Date(date)
  } else {
    dateObj = date
  }
  return dateObj.toLocaleDateString("en-us", {
    year: "numeric",
    month: "long",
    day: "numeric",
  })
}
