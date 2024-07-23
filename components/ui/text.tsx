import { clsx } from "clsx"
import { LinkInternal } from "@/components/ui/link-internal"

export function Text({
  className,
  ...props
}: {
  className?: string
  children: React.ReactNode
}) {
  return (
    <p
      data-slot="text"
      {...props}
      className={clsx(className, "text-base/6 text-stone-500 sm:text-sm/6")}
    />
  )
}

export function Footnote({
  className,
  ...props
}: {
  className?: string
  children: React.ReactNode
}) {
  return (
    <p
      data-slot="text"
      {...props}
      className={clsx(className, "text-sm/6 text-stone-400 sm:text-xs/6")}
    />
  )
}

export function TextLink({
  className,
  href,
  ...props
}: {
  className?: string
  href: string
  children: React.ReactNode
}) {
  return (
    <LinkInternal
      href={href}
      {...props}
      className={clsx(
        className,
        "text-stone-950 underline decoration-stone-950/50 data-[hover]:decoration-stone-950"
      )}
    />
  )
}

export function Strong({
  className,
  ...props
}: {
  className?: string
  children: React.ReactNode
}) {
  return (
    <strong
      {...props}
      className={clsx(className, "font-medium text-stone-950")}
    />
  )
}

export function Code({
  className,
  ...props
}: {
  className?: string
  children: React.ReactNode
}) {
  return (
    <code
      {...props}
      className={clsx(
        className,
        "rounded border border-stone-950/10 bg-stone-950/[2.5%] px-0.5 text-sm font-medium text-stone-950 sm:text-[0.8125rem]"
      )}
    />
  )
}
