import { Button } from "@/components/ui/button"
import { LinkExternal } from "@/components/ui/link-external"
import { fmOAuthForAuthCodeUrl } from "@/lib/oauth"

export function HomeContent() {
  return (
    <LinkExternal href={fmOAuthForAuthCodeUrl} openInNewTab={false}>
      <Button>Continue with Focusmate</Button>
    </LinkExternal>
  )
}
