export function LinkExternal({
  href,
  openInNewTab = false,
  children,
  className,
}: {
  href: string
  openInNewTab: boolean
  children: React.ReactNode
  className?: string
}) {
  return (
    <a
      href={href}
      target={openInNewTab ? "_blank" : "_self"}
      rel="noopener noreferrer"
      className={className}
    >
      {children}
    </a>
  )
}
