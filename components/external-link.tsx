export function ExternalLink({ href, openInNewTab = false, children }: {
  href: string;
  openInNewTab?: boolean;
  children: React.ReactNode;
}) {
  return (
    <a href={href} target={openInNewTab ? "_blank" : "_self"} rel="noopener noreferrer">
      {children}
    </a>
  );
}