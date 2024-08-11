import { Hero } from "@/app/home/components/hero"
import { Reviews } from "@/app/home/components/reviews"
import { CallToAction } from "@/app/home/components/cta"
import { FAQ } from "./components/faq"

export default function Home() {
  return (
    <div className="flex flex-col gap-14">
      <Hero />
      <Reviews />
      <FAQ />
      <CallToAction />
    </div>
  )
}
