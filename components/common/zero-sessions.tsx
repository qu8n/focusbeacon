import { RiEmotionHappyLine } from "@remixicon/react"

export function ZeroSessions() {
  return (
    <div className="inline-flex gap-1 items-center">
      <span>Please try again when you have at least one session</span>
      <RiEmotionHappyLine className="text-stone-600" size={20} />
    </div>
  )
}
