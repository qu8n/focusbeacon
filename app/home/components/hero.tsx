import { Heading } from "@/components/ui/heading"
import { hero } from "./config"
import { RiArrowRightSLine, RiCheckboxCircleLine } from "@remixicon/react"
import { Text } from "@/components/ui/text"
import { SigninButton } from "@/components/common/signin-button"
import { Button } from "@/components/ui/button"
import { LinkInternal } from "@/components/ui/link-internal"

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
              <RiCheckboxCircleLine className="text-stone-700" size={14} />
              <Text>{feature}</Text>
            </div>
          )
        })}
      </div>

      <div className="flex flex-col sm:flex-row gap-4 items-center">
        <SigninButton className="p-1" text={hero.buttonText} />

        <Button outline>
          <LinkInternal
            href="/dashboard/streak?demo=true"
            className="p-1 inline-flex items-center"
          >
            View demo
            <RiArrowRightSLine color="gray" size={15} />
          </LinkInternal>
        </Button>
      </div>
    </div>
  )
}
