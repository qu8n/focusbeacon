"use client"

import { Hero } from "@/app/home/components/hero"
import { Reviews } from "@/app/home/components/reviews"
import { CallToAction } from "@/app/home/components/cta"
import { FAQ } from "@/app/home/components/faq"
import { motion, useAnimation } from "framer-motion"
import { ReactNode, useEffect } from "react"

export default function Home() {
  return (
    <div className="flex flex-col gap-14">
      {sections.map((section, index) => (
        <FadeIn key={section.key} index={index}>
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

// Start wrapped node as invisible and 20px below its final position
const initial = { opacity: 0, y: 20 }

export function FadeIn({
  children,
  index,
}: {
  children: ReactNode
  index: number
}) {
  const controls = useAnimation()

  useEffect(() => {
    controls.start({
      // Fade in and slide up to final position, staggered by index
      opacity: 1,
      y: 0,
      transition: { delay: index * 0.5, duration: 1 },
    })
  }, [controls, index])

  return (
    <motion.div initial={initial} animate={controls}>
      {children}
    </motion.div>
  )
}
