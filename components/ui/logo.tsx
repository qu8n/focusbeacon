import { Avatar } from "@/components/ui/avatar"
import { LinkInternal } from "@/components/ui/link-internal"

export function Logo() {
  return (
    <>
      <Avatar src="/images/icon-192.png" />
      <LinkInternal href="/" className="text-base">
        Focus<span className="font-semibold">Beacon</span>
      </LinkInternal>
    </>
  )
}
