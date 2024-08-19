import { useCallback, useRef } from "react"
import { toPng } from "html-to-image"

export function useScreenshot() {
  const ref = useRef<HTMLDivElement>(null)

  const takeScreenshot = useCallback(() => {
    if (ref.current === null) {
      return
    }

    const wrapper = document.createElement("div")
    wrapper.style.position = "relative"
    wrapper.style.padding = "60px 30px 30px"
    wrapper.style.backgroundColor = "#F3F1EB"
    wrapper.appendChild(ref.current.cloneNode(true))
    wrapper.style.width = `${ref.current.offsetWidth + 60}px` // extra offset must 2x the horizontal padding

    const watermark = document.createElement("div")
    watermark.innerHTML =
      "<b>Focusbeacon.com</b> - Focusmate session statistics & productivity dashboard, 100% free"
    watermark.style.position = "absolute"
    watermark.style.top = "18px"
    watermark.style.left = "50%"
    watermark.style.transform = "translateX(-50%)"
    watermark.style.width = "100%"
    watermark.style.textAlign = "center"
    watermark.style.fontSize = "16px"
    watermark.style.color = "rgba(0, 0, 0, 0.5)"
    wrapper.appendChild(watermark)

    document.body.appendChild(wrapper)

    toPng(wrapper, {
      cacheBust: true,
    })
      .then((dataUrl) => {
        const newTab = window.open()
        if (newTab) {
          newTab.document.body.innerHTML = `<img src="${dataUrl}" alt="Focusbeacon screenshot"/>`
        }
        document.body.removeChild(wrapper)
      })
      .catch((err) => {
        console.log(err)
        document.body.removeChild(wrapper)
      })
  }, [ref])

  return { ref, takeScreenshot }
}
