"use client"

import * as Headless from "@headlessui/react"
import clsx from "clsx"
import type React from "react"
import { Button } from "@/components/ui/button"
import { LinkInternal } from "@/components/ui/link-internal"

export function Dropdown(props: Headless.MenuProps) {
  return <Headless.Menu {...props} />
}

export function DropdownButton<T extends React.ElementType = typeof Button>({
  as = Button,
  ...props
}: { className?: string } & Omit<Headless.MenuButtonProps<T>, "className">) {
  return <Headless.MenuButton as={as} {...props} />
}

export function DropdownMenu({
  anchor = "bottom",
  className,
  ...props
}: { className?: string } & Omit<Headless.MenuItemsProps, "className">) {
  return (
    <Headless.Transition leave="duration-100 ease-in" leaveTo="opacity-0">
      <Headless.MenuItems
        {...props}
        anchor={anchor}
        className={clsx(
          className,
          // Anchor positioning
          "[--anchor-gap:theme(spacing.2)] [--anchor-padding:theme(spacing.1)] data-[anchor~=end]:[--anchor-offset:6px] data-[anchor~=start]:[--anchor-offset:-6px] sm:data-[anchor~=end]:[--anchor-offset:4px] sm:data-[anchor~=start]:[--anchor-offset:-4px]",
          // Base styles
          "isolate w-max rounded-lg p-1",
          // Invisible border that is only visible in `forced-colors` mode for accessibility purposes
          "outline outline-1 outline-transparent focus:outline-none",
          // Handle scrolling when menu won't fit in viewport
          "overflow-y-auto",
          // Popover background
          "bg-white/75 backdrop-blur-xl dark:bg-stone-800/75",
          // Shadows
          "shadow-lg ring-1 ring-stone-950/10 dark:ring-inset dark:ring-white/10",
          // Define grid at the menu level if subgrid is supported
          "supports-[grid-template-columns:subgrid]:grid supports-[grid-template-columns:subgrid]:grid-cols-[auto_1fr_1.5rem_0.5rem_auto]"
        )}
      />
    </Headless.Transition>
  )
}

export function DropdownItem({
  className,
  ...props
}: { className?: string } & (
  | Omit<React.ComponentPropsWithoutRef<typeof LinkInternal>, "className">
  | Omit<React.ComponentPropsWithoutRef<"button">, "className">
)) {
  const classes = clsx(
    className,
    // Base styles
    "group rounded-md px-3.5 py-2.5 focus:outline-none sm:px-3 sm:py-1.5",
    // Text styles
    "text-left text-base/6 text-stone-950 sm:text-sm/6",
    // Focus
    "data-[focus]:bg-stone-200 data-[focus]:text-stone-800 cursor-pointer",
    // Disabled state
    "data-[disabled]:opacity-50",
    // Use subgrid when available but fallback to an explicit grid layout if not
    "col-span-full grid grid-cols-[auto_1fr_1.5rem_0.5rem_auto] items-center supports-[grid-template-columns:subgrid]:grid-cols-subgrid"
  )

  return (
    <Headless.MenuItem>
      {"href" in props ? (
        <LinkInternal {...props} className={classes} />
      ) : (
        <button type="button" {...props} className={classes} />
      )}
    </Headless.MenuItem>
  )
}
