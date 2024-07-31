import clsx from "clsx"
import React from "react"

const colors = {
  lime: "bg-lime-400/20 text-lime-700 group-data-[hover]:bg-lime-400/30",
  pink: "bg-pink-400/15 text-pink-700 group-data-[hover]:bg-pink-400/25",
  stone: "bg-stone-600/10 text-stone-700 group-data-[hover]:bg-stone-600/20",
}

type BadgeProps = { color?: keyof typeof colors }

export function Badge({
  color = "stone",
  className,
  ...props
}: BadgeProps & React.ComponentPropsWithoutRef<"span">) {
  return (
    <span
      {...props}
      className={clsx(
        className,
        "inline-flex items-center gap-x-1.5 rounded-md px-1.5 py-0.5 text-sm/5 font-medium sm:text-xs/5 forced-colors:outline",
        colors[color]
      )}
    />
  )
}
