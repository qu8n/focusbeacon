import { Reviews } from "@/components/common/reviews"
import { Button } from "@/components/ui/button"
import { LinkExternal } from "@/components/ui/link-external"
import { fmOAuthForAuthCodeUrl } from "@/lib/oauth"

export function HomeContent() {
  return (
    <div className="flex flex-col gap-8">
      <LinkExternal href={fmOAuthForAuthCodeUrl} openInNewTab={false}>
        <Button>Continue with Focusmate</Button>
      </LinkExternal>

      <Reviews />
    </div>
  )
}
