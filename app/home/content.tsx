import { Reviews } from "@/components/common/reviews"
import { Button } from "@/components/ui/button"
import { LinkExternal } from "@/components/ui/link-external"
import { fmOAuthForAuthCodeUrl } from "@/lib/oauth"
import { Text } from "@/components/ui/text"
import { Heading } from "@/components/ui/heading"

export function HomeContent() {
  return (
    <div className="flex flex-col gap-8">
      <div className="flex flex-col items-center my-20">
        <Heading className="text-3xl font-bold max-w-xs sm:max-w-none text-center">
          Unlock your Focusmate stats
        </Heading>
        <Text className="max-w-xs text-center mt-3 sm:mt-1">
          Get insights on your session history, stay motivated, and crush your
          goals
        </Text>

        <LinkExternal
          href={fmOAuthForAuthCodeUrl}
          openInNewTab={false}
          className="mt-6"
        >
          <Button color="orange">
            <span className="p-1">View your dashboard</span>
          </Button>
        </LinkExternal>
      </div>

      <Reviews />
    </div>
  )
}
