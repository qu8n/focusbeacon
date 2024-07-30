import { Callout } from "@/components/ui/callout"
import { LinkInternal } from "@/components/ui/link-internal"

export function DemoCallout() {
  return (
    <Callout variant="warning" title="You're viewing demo data.">
      <span>
        This data is not real and is for demonstration purposes only. To return
        home, click{" "}
      </span>
      <LinkInternal href="/home" className="underline">
        here
      </LinkInternal>
      .
    </Callout>
  )
}
