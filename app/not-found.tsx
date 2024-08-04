import { LinkInternal } from "@/components/ui/link-internal"
import { Text, TextLink } from "@/components/ui/text"

export default function NotFound() {
  return (
    <div className="mt-4">
      <Text>Sorry, this page does not exist.</Text>
      <Text>
        Click{" "}
        <LinkInternal href="/home">
          <TextLink>here</TextLink>{" "}
        </LinkInternal>
        to return home.
      </Text>
    </div>
  )
}
