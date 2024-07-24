// Tremor Raw Card [v0.0.0]

import React from "react"
import { Slot } from "@radix-ui/react-slot"

import { cx } from "@/lib/utils"
import { Text, Strong } from "@/components/ui/text"
interface CardProps extends React.ComponentPropsWithoutRef<"div"> {
  asChild?: boolean
  title?: string
  subtitle?: string
}

const Card = React.forwardRef<HTMLDivElement, CardProps>(
  ({ className, asChild, title, subtitle, ...props }, forwardedRef) => {
    const Component = asChild ? Slot : "div"
    return (
      <Component
        ref={forwardedRef}
        className={cx(
          "relative w-full rounded-md border p-6 text-left shadow-sm",
          "bg-[#FDFDFA]",
          "border-stone-200",
          className
        )}
        {...props}
      >
        {title && (
          <Text className="mb-3 flex flex-col">
            <Strong>{title}</Strong>
            <span>{subtitle}</span>
          </Text>
        )}
        {props.children}
      </Component>
    )
  }
)

Card.displayName = "Card"

export { Card, type CardProps }
