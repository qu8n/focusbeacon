import { Hero } from "@/app/home/components/hero"
import { Reviews } from "@/app/home/components/reviews"
import { Tweets } from "@/app/home/components/tweets"
import { CallToAction } from "@/app/home/components/cta"

export default function Home() {
  return (
    <div className="flex flex-col gap-14">
      <Hero />
      <Reviews />
      <Tweets />
      <CallToAction />
    </div>
  )
}
