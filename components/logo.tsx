import { Avatar } from "@/components/avatar"
import { LinkInternal } from "@/components/link-internal"

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
