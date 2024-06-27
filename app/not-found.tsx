import { Text, TextLink } from "@/components/ui/text"

export default function NotFound() {
  return (
    <div className="mt-4">
      <Text>Sorry, this page does not exist.</Text>
      <Text>
        Click <TextLink href="/home">here</TextLink> to return home.
      </Text>
    </div>
  )
}
