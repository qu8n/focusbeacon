import { Heading } from "@/components/ui/heading"
import { hero } from "@/app/home/components/config"
import { RiArrowRightSLine, RiCheckboxCircleLine } from "@remixicon/react"
import { Strong, Text } from "@/components/ui/text"
import { SigninButton } from "@/components/common/signin-button"
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
        <SigninButton text={hero.buttonText} />

        {/* <Button outline> */}
        <LinkInternal
          href="/dashboard/streak?demo=true"
          className="inline-flex items-center hover:opacity-90"
        >
          <Strong>
            <Text>View demo</Text>
          </Strong>
          <RiArrowRightSLine color="gray" size={15} />
        </LinkInternal>
        {/* </Button> */}
      </div>
    </div>
  )
}
