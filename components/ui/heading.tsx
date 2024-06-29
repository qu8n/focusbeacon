import { Fraunces } from "next/font/google"
import { cx } from "@/lib/utils"

const fraunces = Fraunces({
  subsets: ["latin"],
  display: "swap",
})

type HeadingProps = {
  level?: 1 | 2 | 3 | 4 | 5 | 6
} & React.ComponentPropsWithoutRef<"h1" | "h2" | "h3" | "h4" | "h5" | "h6">

export function Heading({ className, level = 1, ...props }: HeadingProps) {
  const Element: `h${typeof level}` = `h${level}`

  return (
    <Element
      {...props}
      className={cx(
        className,
        fraunces.className,
        "text-3xl/8 first-letter:uppercase font-semibold text-zinc-950 sm:text-2xl/8 dark:text-white"
      )}
    />
  )
}

export function Subheading({ className, level = 2, ...props }: HeadingProps) {
  const Element: `h${typeof level}` = `h${level}`

  return (
    <Element
      {...props}
      className={cx(
        className,
        "text-md/7 font-medium text-zinc-950 sm:text-sm/6 dark:text-white"
      )}
    />
  )
}
