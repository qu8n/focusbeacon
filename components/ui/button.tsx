import * as Headless from "@headlessui/react"
import { clsx } from "clsx"
import React from "react"
import { LinkInternal } from "@/components/ui/link-internal"

const styles = {
  base: [
    // Base
    "relative first-letter:uppercase isolate inline-flex items-center justify-center gap-x-2 rounded-lg border font-semibold cursor-pointer",
    // Sizing
    "px-[calc(theme(spacing[3.5])-1px)] py-[calc(theme(spacing[2.5])-1px)] sm:px-[calc(theme(spacing.3)-1px)] sm:py-[calc(theme(spacing[1.5])-1px)] sm:text-sm/6",
    // Focus
    "focus:outline-none data-[focus]:outline data-[focus]:outline-2 data-[focus]:outline-offset-2 data-[focus]:outline-blue-500",
    // Disabled
    "data-[disabled]:opacity-50",
    // Icon
    "[&>[data-slot=icon]]:-mx-0.5 [&>[data-slot=icon]]:my-0.5 [&>[data-slot=icon]]:size-5 [&>[data-slot=icon]]:shrink-0 [&>[data-slot=icon]]:text-[--btn-icon] [&>[data-slot=icon]]:sm:my-1 [&>[data-slot=icon]]:sm:size-4 forced-colors:[--btn-icon:ButtonText] forced-colors:data-[hover]:[--btn-icon:ButtonText]",
  ],
  solid: [
    // Optical border, implemented as the button background to avoid corner artifacts
    "border-transparent bg-[--btn-border]",
    // Button background, implemented as foreground layer to stack on top of pseudo-border layer
    "before:absolute before:inset-0 before:-z-10 before:rounded-[calc(theme(borderRadius.lg)-1px)] before:bg-[--btn-bg]",
    // Drop shadow, applied to the inset `before` layer so it blends with the border
    "before:shadow",
    // Shim/overlay, inset to match button foreground and used for hover state + highlight shadow
    "after:absolute after:inset-0 after:-z-10 after:rounded-[calc(theme(borderRadius.lg)-1px)]",
    // Inner highlight shadow
    "after:shadow-[shadow:inset_0_1px_theme(colors.white/15%)]",
    // White overlay on hover
    "after:data-[active]:bg-[--btn-hover-overlay] after:data-[hover]:bg-[--btn-hover-overlay]",
    // Disabled
    "before:data-[disabled]:shadow-none after:data-[disabled]:shadow-none",
  ],
  outline: [
    // Base
    "border-stone-950/10 text-stone-950 data-[active]:bg-stone-950/[2.5%] data-[hover]:bg-stone-950/[2.5%]",
    // Icon
    "[--btn-icon:theme(colors.stone.500)] data-[active]:[--btn-icon:theme(colors.stone.700)] data-[hover]:[--btn-icon:theme(colors.stone.700)]",
  ],
  plain: [
    // Base
    "border-transparent text-stone-950 data-[active]:bg-stone-950/5 data-[hover]:bg-stone-950/5",
    // Icon
    "[--btn-icon:theme(colors.stone.500)] data-[active]:[--btn-icon:theme(colors.stone.700)] data-[hover]:[--btn-icon:theme(colors.stone.700)]",
  ],
  colors: {
    "dark/stone": [
      "text-white [--btn-bg:theme(colors.stone.900)] [--btn-border:theme(colors.stone.950/90%)] [--btn-hover-overlay:theme(colors.white/10%)]",
      "[--btn-icon:theme(colors.stone.400)] data-[active]:[--btn-icon:theme(colors.stone.300)] data-[hover]:[--btn-icon:theme(colors.stone.300)]",
    ],
    light: [
      "text-stone-950 [--btn-bg:white] [--btn-border:theme(colors.stone.950/10%)] [--btn-hover-overlay:theme(colors.stone.950/2.5%)] data-[active]:[--btn-border:theme(colors.stone.950/15%)] data-[hover]:[--btn-border:theme(colors.stone.950/15%)]",
      "[--btn-icon:theme(colors.stone.500)] data-[active]:[--btn-icon:theme(colors.stone.700)] data-[hover]:[--btn-icon:theme(colors.stone.700)]",
    ],
    "dark/white": [
      "text-white [--btn-bg:theme(colors.stone.900)] [--btn-border:theme(colors.stone.950/90%)] [--btn-hover-overlay:theme(colors.white/10%)]",
      "[--btn-icon:theme(colors.stone.400)] data-[active]:[--btn-icon:theme(colors.stone.300)] data-[hover]:[--btn-icon:theme(colors.stone.300)]",
    ],
    dark: [
      "text-white [--btn-bg:theme(colors.stone.900)] [--btn-border:theme(colors.stone.950/90%)] [--btn-hover-overlay:theme(colors.white/10%)]",
      "[--btn-icon:theme(colors.stone.400)] data-[active]:[--btn-icon:theme(colors.stone.300)] data-[hover]:[--btn-icon:theme(colors.stone.300)]",
    ],
    white: [
      "text-stone-950 [--btn-bg:white] [--btn-border:theme(colors.stone.950/10%)] [--btn-hover-overlay:theme(colors.stone.950/2.5%)] data-[active]:[--btn-border:theme(colors.stone.950/15%)] data-[hover]:[--btn-border:theme(colors.stone.950/15%)]",
      "[--btn-icon:theme(colors.stone.400)] data-[active]:[--btn-icon:theme(colors.stone.500)] data-[hover]:[--btn-icon:theme(colors.stone.500)]",
    ],
    stone: [
      "text-white [--btn-hover-overlay:theme(colors.white/10%)] [--btn-bg:theme(colors.stone.600)] [--btn-border:theme(colors.stone.700/90%)]",
      "[--btn-icon:theme(colors.stone.400)] data-[active]:[--btn-icon:theme(colors.stone.300)] data-[hover]:[--btn-icon:theme(colors.stone.300)]",
    ],
    indigo: [
      "text-white [--btn-hover-overlay:theme(colors.white/10%)] [--btn-bg:theme(colors.indigo.500)] [--btn-border:theme(colors.indigo.600/90%)]",
      "[--btn-icon:theme(colors.indigo.300)] data-[active]:[--btn-icon:theme(colors.indigo.200)] data-[hover]:[--btn-icon:theme(colors.indigo.200)]",
    ],
    cyan: [
      "text-cyan-950 [--btn-bg:theme(colors.cyan.300)] [--btn-border:theme(colors.cyan.400/80%)] [--btn-hover-overlay:theme(colors.white/25%)]",
      "[--btn-icon:theme(colors.cyan.500)]",
    ],
    red: [
      "text-white [--btn-hover-overlay:theme(colors.white/10%)] [--btn-bg:theme(colors.red.600)] [--btn-border:theme(colors.red.700/90%)]",
      "[--btn-icon:theme(colors.red.300)] data-[active]:[--btn-icon:theme(colors.red.200)] data-[hover]:[--btn-icon:theme(colors.red.200)]",
    ],
    orange: [
      "text-orange-950 [--btn-hover-overlay:theme(colors.white/10%)] [--btn-bg:theme(colors.orange.300/80%)] [--btn-border:theme(colors.orange.400/80%)]",
      "[--btn-icon:theme(colors.orange.600)]",
    ],
    amber: [
      "text-amber-950 [--btn-hover-overlay:theme(colors.white/25%)] [--btn-bg:theme(colors.amber.400)] [--btn-border:theme(colors.amber.500/80%)]",
      "[--btn-icon:theme(colors.amber.600)]",
    ],
    yellow: [
      "text-yellow-950 [--btn-hover-overlay:theme(colors.white/25%)] [--btn-bg:theme(colors.yellow.300)] [--btn-border:theme(colors.yellow.400/80%)]",
      "[--btn-icon:theme(colors.yellow.600)] data-[active]:[--btn-icon:theme(colors.yellow.700)] data-[hover]:[--btn-icon:theme(colors.yellow.700)]",
    ],
    lime: [
      "text-lime-950 [--btn-hover-overlay:theme(colors.white/25%)] [--btn-bg:theme(colors.lime.300)] [--btn-border:theme(colors.lime.400/80%)]",
      "[--btn-icon:theme(colors.lime.600)] data-[active]:[--btn-icon:theme(colors.lime.700)] data-[hover]:[--btn-icon:theme(colors.lime.700)]",
    ],
    green: [
      "text-white [--btn-hover-overlay:theme(colors.white/10%)] [--btn-bg:theme(colors.green.600)] [--btn-border:theme(colors.green.700/90%)]",
      "[--btn-icon:theme(colors.white/60%)] data-[active]:[--btn-icon:theme(colors.white/80%)] data-[hover]:[--btn-icon:theme(colors.white/80%)]",
    ],
    emerald: [
      "text-white [--btn-hover-overlay:theme(colors.white/10%)] [--btn-bg:theme(colors.emerald.600)] [--btn-border:theme(colors.emerald.700/90%)]",
      "[--btn-icon:theme(colors.white/60%)] data-[active]:[--btn-icon:theme(colors.white/80%)] data-[hover]:[--btn-icon:theme(colors.white/80%)]",
    ],
    teal: [
      "text-white [--btn-hover-overlay:theme(colors.white/10%)] [--btn-bg:theme(colors.teal.600)] [--btn-border:theme(colors.teal.700/90%)]",
      "[--btn-icon:theme(colors.white/60%)] data-[active]:[--btn-icon:theme(colors.white/80%)] data-[hover]:[--btn-icon:theme(colors.white/80%)]",
    ],
    sky: [
      "text-white [--btn-hover-overlay:theme(colors.white/10%)] [--btn-bg:theme(colors.sky.500)] [--btn-border:theme(colors.sky.600/80%)]",
      "[--btn-icon:theme(colors.white/60%)] data-[active]:[--btn-icon:theme(colors.white/80%)] data-[hover]:[--btn-icon:theme(colors.white/80%)]",
    ],
    blue: [
      "text-white [--btn-hover-overlay:theme(colors.white/10%)] [--btn-bg:theme(colors.blue.600)] [--btn-border:theme(colors.blue.700/90%)]",
      "[--btn-icon:theme(colors.blue.400)] data-[active]:[--btn-icon:theme(colors.blue.300)] data-[hover]:[--btn-icon:theme(colors.blue.300)]",
    ],
    violet: [
      "text-white [--btn-hover-overlay:theme(colors.white/10%)] [--btn-bg:theme(colors.violet.500)] [--btn-border:theme(colors.violet.600/90%)]",
      "[--btn-icon:theme(colors.violet.300)] data-[active]:[--btn-icon:theme(colors.violet.200)] data-[hover]:[--btn-icon:theme(colors.violet.200)]",
    ],
    purple: [
      "text-white [--btn-hover-overlay:theme(colors.white/10%)] [--btn-bg:theme(colors.purple.500)] [--btn-border:theme(colors.purple.600/90%)]",
      "[--btn-icon:theme(colors.purple.300)] data-[active]:[--btn-icon:theme(colors.purple.200)] data-[hover]:[--btn-icon:theme(colors.purple.200)]",
    ],
    fuchsia: [
      "text-white [--btn-hover-overlay:theme(colors.white/10%)] [--btn-bg:theme(colors.fuchsia.500)] [--btn-border:theme(colors.fuchsia.600/90%)]",
      "[--btn-icon:theme(colors.fuchsia.300)] data-[active]:[--btn-icon:theme(colors.fuchsia.200)] data-[hover]:[--btn-icon:theme(colors.fuchsia.200)]",
    ],
    pink: [
      "text-white [--btn-hover-overlay:theme(colors.white/10%)] [--btn-bg:theme(colors.pink.500)] [--btn-border:theme(colors.pink.600/90%)]",
      "[--btn-icon:theme(colors.pink.300)] data-[active]:[--btn-icon:theme(colors.pink.200)] data-[hover]:[--btn-icon:theme(colors.pink.200)]",
    ],
    rose: [
      "text-white [--btn-hover-overlay:theme(colors.white/10%)] [--btn-bg:theme(colors.rose.500)] [--btn-border:theme(colors.rose.600/90%)]",
      "[--btn-icon:theme(colors.rose.300)] data-[active]:[--btn-icon:theme(colors.rose.200)] data-[hover]:[--btn-icon:theme(colors.rose.200)]",
    ],
  },
}

type ButtonProps = (
  | { color?: keyof typeof styles.colors; outline?: never; plain?: never }
  | { color?: never; outline: true; plain?: never }
  | { color?: never; outline?: never; plain: true }
) & { className?: string; children: React.ReactNode } & (
    | Omit<Headless.ButtonProps, "className">
    | Omit<React.ComponentPropsWithoutRef<typeof LinkInternal>, "className">
  )

export const Button = React.forwardRef(function Button(
  { color, outline, plain, className, children, ...props }: ButtonProps,
  ref: React.ForwardedRef<HTMLElement>
) {
  const classes = clsx(
    className,
    styles.base,
    outline
      ? styles.outline
      : plain
        ? styles.plain
        : clsx(styles.solid, styles.colors[color ?? "dark/stone"])
  )

  return "href" in props ? (
    <LinkInternal
      {...props}
      className={classes}
      ref={ref as React.ForwardedRef<HTMLAnchorElement>}
    >
      <TouchTarget>{children}</TouchTarget>
    </LinkInternal>
  ) : (
    <Headless.Button
      {...props}
      className={clsx(classes, "cursor-default")}
      ref={ref}
    >
      <TouchTarget>{children}</TouchTarget>
    </Headless.Button>
  )
})

/**
 * Expand the hit area to at least 44×44px on touch devices
 */
export function TouchTarget({ children }: { children: React.ReactNode }) {
  return (
    <>
      <span
        className="absolute pointer-events-none left-1/2 top-1/2 size-[max(100%,2.75rem)] -translate-x-1/2 -translate-y-1/2 [@media(pointer:fine)]:hidden"
        aria-hidden="true"
      />
      {children}
    </>
  )
}
