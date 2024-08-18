import {
  AnimationDefinition,
  motion,
  Target,
  useAnimation,
  VariantLabels,
} from "framer-motion"
import { ReactNode, useEffect } from "react"

export function FadeIn({
  children,
  index,
  initial,
  animationDefinition,
}: {
  children: ReactNode
  index: number
  initial: boolean | Target | VariantLabels
  animationDefinition: AnimationDefinition
}) {
  const controls = useAnimation()

  useEffect(() => {
    controls.start(animationDefinition)
  }, [animationDefinition, controls, index])

  return (
    <motion.div initial={initial} animate={controls}>
      {children}
    </motion.div>
  )
}
