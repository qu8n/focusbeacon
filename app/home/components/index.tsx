import { Hero } from "@/app/home/components/hero"
import { Reviews } from "@/app/home/components/reviews"
import { Tweets } from "@/app/home/components/tweets"

export function HomeContent() {
  return (
    <div className="flex flex-col gap-14">
      <Hero />
      <Reviews />
      <Tweets />
    </div>
  )
}
