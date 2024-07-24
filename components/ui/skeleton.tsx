import { cx } from "@/lib/utils"

export function Skeleton({
  className,
  ...props
}: React.HTMLAttributes<HTMLDivElement>) {
  return (
    <div
      className={cx("animate-pulse rounded-md bg-[#EAE7DC]", className)}
      {...props}
    />
  )
}
