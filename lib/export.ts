import { SessionDetails } from "@/components/charts/history-table"

export function exportJSONToCSV(objArray: SessionDetails[]) {
  const arr = typeof objArray !== "object" ? JSON.parse(objArray) : objArray
  const str =
    `${Object.keys(arr[0])
      .map((value) => `"${value}"`)
      .join(",")}` + "\r\n"
  const csvContent = arr.reduce((st: string, next: SessionDetails) => {
    st +=
      `${Object.values(next)
        .map((value) => `"${value}"`)
        .join(",")}` + "\r\n"
    return st
  }, str)

  const element = document.createElement("a")
  element.href = "data:text/csv;charset=utf-8," + encodeURI(csvContent)
  element.target = "_blank"
  element.download = "export.csv"
  element.click()
}
