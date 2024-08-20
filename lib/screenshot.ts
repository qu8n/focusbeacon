import { toPng } from "html-to-image"

export async function takeScreenshot(ref: React.RefObject<HTMLElement>) {
  if (ref.current === null) {
    return
  }

  const wrapper = document.createElement("div")
  wrapper.style.position = "relative"
  wrapper.style.padding = "30px 30px 80px"
  wrapper.style.backgroundColor = "#F3F1EB"
  wrapper.appendChild(ref.current.cloneNode(true))
  wrapper.style.width = `${ref.current.offsetWidth + 60}px` // extra offset must 2x the horizontal padding

  const watermark = document.createElement("div")
  watermark.innerHTML =
    "<b>Focusbeacon.com</b> - Focusmate session statistics & productivity dashboard"
  watermark.style.position = "absolute"
  watermark.style.padding = "0px 30px 0px"
  watermark.style.bottom = "20px"
  watermark.style.left = "50%"
  watermark.style.transform = "translateX(-50%)"
  watermark.style.width = "100%"
  watermark.style.textAlign = "center"
  watermark.style.fontSize = "14px"
  watermark.style.color = "rgba(0, 0, 0, 0.3)"
  wrapper.appendChild(watermark)

  document.body.appendChild(wrapper)

  toPng(wrapper, {
    cacheBust: true,
  })
    .then((dataUrl) => {
      const newTab = window.open()
      if (newTab) {
        newTab.document.body.innerHTML = `
          <br/>
          <button id="downloadBtn">Download image</button>
          <br/>
          <br/>
          <img src="${dataUrl}" alt="Focusbeacon screenshot"/>
        `
        const downloadBtn = newTab.document.getElementById("downloadBtn")
        if (downloadBtn) {
          downloadBtn.style.backgroundColor = "#FFC38B"
          downloadBtn.style.color = "black"
          downloadBtn.style.borderRadius = "10px"
          downloadBtn.style.padding = "8px 16px"
          downloadBtn.style.border = "none"
          downloadBtn.style.fontFamily = "Arial, sans-serif"
          downloadBtn.style.fontSize = "14px"
          downloadBtn.style.cursor = "pointer"

          downloadBtn.addEventListener("click", () => {
            const link = newTab.document.createElement("a")
            link.href = dataUrl
            link.download = "focusbeacon-stats.jpg"
            newTab.document.body.appendChild(link)
            link.click()
            newTab.document.body.removeChild(link)
          })
        }
      }
      document.body.removeChild(wrapper)
    })
    .catch((err) => {
      console.error(err)
      document.body.removeChild(wrapper)
    })
}
