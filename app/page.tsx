import { ExternalLink } from "@/components/external-link"
import { fmOAuthForAuthCodeUrl } from "@/lib/oauth"

export default function Home() {
  return (
    <ExternalLink href={fmOAuthForAuthCodeUrl}>
      <button type="button">
        <p>Login with Focusmate</p>
      </button>
    </ExternalLink>
  )
}
