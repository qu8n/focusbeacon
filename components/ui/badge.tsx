import * as Headless from "@headlessui/react"
import clsx from "clsx"
import React from "react"
import { TouchTarget } from "@/components/ui/button"
import { LinkInternal } from "@/components/ui/link-internal"

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

export const BadgeButton = React.forwardRef(function BadgeButton(
  {
    color = "stone",
    className,
    children,
    ...props
  }: BadgeProps & { className?: string; children: React.ReactNode } & (
      | Omit<Headless.ButtonProps, "className">
      | Omit<React.ComponentPropsWithoutRef<typeof LinkInternal>, "className">
    ),
  ref: React.ForwardedRef<HTMLElement>
) {
  const classes = clsx(
    className,
    "group relative inline-flex rounded-md focus:outline-none data-[focus]:outline data-[focus]:outline-2 data-[focus]:outline-offset-2 data-[focus]:outline-blue-500"
  )

  return "href" in props ? (
    <LinkInternal
      {...props}
      className={classes}
      ref={ref as React.ForwardedRef<HTMLAnchorElement>}
    >
      <TouchTarget>
        <Badge color={color}>{children}</Badge>
      </TouchTarget>
    </LinkInternal>
  ) : (
    <Headless.Button {...props} className={classes} ref={ref}>
      <TouchTarget>
        <Badge color={color}>{children}</Badge>
      </TouchTarget>
    </Headless.Button>
  )
})
