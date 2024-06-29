import { Subheading } from "@/components/ui/heading"
import { cta, hero } from "./config"
import { SigninButton } from "@/components/common/signin-button"

export function CallToAction() {
  return (
    <div className="relative h-full w-full px-2 justify-center overflow-hidden rounded-lg border py-8 sm:shadow-sm flex flex-col gap-4 items-center bg-orange-300 bg-opacity-20 border-orange-300/[0.4]">
      {/* eslint-disable-next-line @next/next/no-img-element */}
      <img
        src="/images/globe.png"
        alt=""
        className="w-120 h-120 absolute inset-y-10 opacity-5 pointer-events-none"
      />

      <Subheading className="max-w-xs sm:max-w-sm text-center">
        {cta.titleBefore}{" "}
        <span className="underline underline-offset-2 decoration-2 decoration-wavy decoration-orange-400">
          {cta.titleUnderlined}
        </span>{" "}
        {cta.titleAfter}
      </Subheading>

      <SigninButton className="p-1" text={hero.buttonText} />
    </div>
  )
}
