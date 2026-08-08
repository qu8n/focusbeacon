/**
 * Text with a brightening band sweeping across it. The string is duplicated
 * into `data-text` so the `.shimmer-text` pseudo-element can paint the gradient
 * copy on top — see app/globals.css.
 */
export function ShimmerText({ children }: { children: string }) {
  return (
    <span data-text={children} className="shimmer-text">
      {children}
    </span>
  )
}
