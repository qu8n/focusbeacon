import { Footnote } from "@/components/ui/text"
import { LinkInternal } from "@/components/ui/link-internal"
import { LinkExternal } from "@/components/ui/link-external"
import { RiExternalLinkLine } from "@remixicon/react"

export const CONTACT_URL = "https://forms.gle/D7k33QwMUzK2m1vb7"

export const NAV_ITEMS = [
  {
    label: "Home",
    url: "/home",
  },
  {
    label: "About",
    url: "/about",
  },
  {
    label: "Privacy",
    url: "/privacy",
  },
  {
    label: "Contact",
    url: CONTACT_URL,
  },
]

export function Footer() {
  return (
    <div className="w-full flex flex-col sm:flex-row-reverse justify-between items-center gap-6 mb-6">
      <div className="inline-flex gap-4 items-center">
        {NAV_ITEMS.map(({ label, url }) => {
          if (url[0] === "/") {
            return (
              <LinkInternal key={label} href={url}>
                <Footnote key={label}>{label}</Footnote>
              </LinkInternal>
            )
          } else {
            return (
              <LinkExternal
                key={label}
                href={url}
                openInNewTab
                className="flex flex-row items-center gap-1"
              >
                <RiExternalLinkLine className="size-3" color="gray" />
                <Footnote key={label}>{label}</Footnote>
              </LinkExternal>
            )
          }
        })}
      </div>

      <div className="inline-flex items-center gap-3">
        <Footnote>© Focusbeacon</Footnote>
        <iframe
          src="https://ghbtns.com/github-btn.html?user=qu8n&repo=focusbeacon&type=star&count=true"
          width="82"
          height="20"
          title="GitHub"
          className="opacity-80"
        />
      </div>
    </div>
  )
}
