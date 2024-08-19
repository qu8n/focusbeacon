// Tremor Raw Card [v0.0.0]

import { forwardRef, ReactNode } from "react"
import { Slot } from "@radix-ui/react-slot"

import { cx } from "@/lib/tw-class-merge"
import { Text, Strong } from "@/components/ui/text"
import { InfoPopover } from "../common/info-popover"
interface CardProps extends React.ComponentPropsWithoutRef<"div"> {
  asChild?: boolean
  icon?: ReactNode
  title?: string
  subtitle?: string
  popoverContent?: string
}

const Card = forwardRef<HTMLDivElement, CardProps>(
  (
    { className, asChild, icon, title, subtitle, popoverContent, ...props },
    forwardedRef
  ) => {
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
          <div className="mb-1 flex flex-row gap-1 items-center">
            {icon}
            <Text className="flex flex-col w-full">
              <div className="flex flex-row items-center justify-between">
                <Strong>{title}</Strong>
                {popoverContent ? (
                  <InfoPopover>{popoverContent}</InfoPopover>
                ) : null}
              </div>
              <span>{subtitle}</span>
            </Text>
          </div>
        )}
        {props.children}
      </Component>
    )
  }
)

Card.displayName = "Card"

export { Card, type CardProps }
