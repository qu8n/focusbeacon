/* eslint-disable @next/next/no-img-element */

import { LinkInternal } from "@/components/ui/link-internal"

export function Logo() {
  return (
    <>
      <img src="/images/icon-192.png" className="size-6" alt="logo" />
      <LinkInternal href="/" className="text-base">
        <span className="font-normal">Focus</span>
        <span className="font-semibold">beacon</span>
      </LinkInternal>
    </>
  )
}
