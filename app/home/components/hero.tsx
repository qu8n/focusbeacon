import { Heading } from "@/components/ui/heading"
import { hero } from "./config"
import { RiCheckboxCircleLine } from "@remixicon/react"
import { LinkExternal } from "@/components/ui/link-external"
import { fmOAuthForAuthCodeUrl } from "@/lib/oauth"
import { Button } from "@/components/ui/button"
import { Text } from "@/components/ui/text"

export function Hero() {
  return (
    <div className="flex flex-col gap-4 mt-12 items-center">
      <Heading className="text-3xl font-bold max-w-xs sm:max-w-none text-center">
        {hero.title}
      </Heading>

      <div className="flex flex-col items-center">
        {hero.features.map((feature) => {
          return (
            <div key={feature} className="inline-flex items-center gap-2">
              <RiCheckboxCircleLine className="text-zinc-700" size={14} />
              <Text>{feature}</Text>
            </div>
          )
        })}
      </div>

      <LinkExternal
        href={fmOAuthForAuthCodeUrl}
        openInNewTab={false}
        className="mx-auto"
      >
        <Button color="orange">
          <span className="p-1">{hero.buttonText}</span>
        </Button>
      </LinkExternal>
    </div>
  )
}
