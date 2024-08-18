"use client"

import { Hero } from "@/app/home/components/hero"
import { Reviews } from "@/app/home/components/reviews"
import { CallToAction } from "@/app/home/components/cta"
import { FAQ } from "@/app/home/components/faq"
import { FadeIn } from "@/components/common/fade-in"

export default function Home() {
  return (
    <div className="flex flex-col gap-14">
      {sections.map((section, index) => (
        <FadeIn
          key={section.key}
          index={index}
          // Start out as invisible and 20px below final position
          initial={{ opacity: 0, y: 20 }}
          animationDefinition={{
            // Slide up to final position, staggered by index
            opacity: 1,
            y: 0,
            transition: { delay: index * 0.5, duration: 0.5 },
          }}
        >
          {section.component}
        </FadeIn>
      ))}
    </div>
  )
}

const sections = [
  { component: <Hero />, key: "hero" },
  { component: <Reviews />, key: "reviews" },
  { component: <FAQ />, key: "faq" },
  { component: <CallToAction />, key: "cta" },
]
