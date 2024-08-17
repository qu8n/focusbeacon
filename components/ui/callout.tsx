// Tremor Raw Callout [v0.0.0]

import React from "react"
import { tv, type VariantProps } from "tailwind-variants"
import { cx } from "@/lib/tw-class-merge"

const calloutVariants = tv({
  base: "flex flex-col overflow-hidden rounded-md p-4 text-sm",
  variants: {
    variant: {
      warning: [
        // text color
        " text-yellow-900 dark:text-yellow-500",
        // background color
        "bg-yellow-50 dark:bg-yellow-950/70",
      ],
    },
  },
  defaultVariants: {
    variant: "warning",
  },
})

interface CalloutProps
  extends React.ComponentPropsWithoutRef<"div">,
    VariantProps<typeof calloutVariants> {
  title: string
  icon?: React.ElementType | React.ReactElement
}

const Callout = React.forwardRef<HTMLDivElement, CalloutProps>(
  (
    { title, icon: Icon, className, variant, children, ...props }: CalloutProps,
    forwardedRef
  ) => {
    return (
      <div
        ref={forwardedRef}
        className={cx(calloutVariants({ variant }), className)}
        {...props}
      >
        <div className={cx("flex items-start")}>
          {Icon && typeof Icon === "function" ? (
            <Icon
              className={cx("mr-1.5 h-5 w-5 shrink-0")}
              aria-hidden="true"
            />
          ) : (
            Icon
          )}
          <span className={cx("font-semibold")}>{title}</span>
        </div>
        <div className={cx("overflow-y-auto", children ? "mt-2" : "")}>
          {children}
        </div>
      </div>
    )
  }
)

Callout.displayName = "Callout"

export { Callout, calloutVariants, type CalloutProps }
