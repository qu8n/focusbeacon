import { Subheading } from "@/components/ui/heading"
import { cta, hero } from "./config"
import { LinkExternal } from "@/components/ui/link-external"
import { fmOAuthForAuthCodeUrl } from "@/lib/oauth"
import { Button } from "@/components/ui/button"

export function CallToAction() {
  return (
    <div className="relative h-full w-full justify-center overflow-hidden rounded-lg border py-8 sm:shadow-sm flex flex-col gap-4 items-center bg-orange-300 bg-opacity-20 border-orange-300/[0.4]">
      {/* eslint-disable-next-line @next/next/no-img-element */}
      <img
        src="/images/globe.png"
        alt=""
        className="w-120 h-120 absolute inset-y-10 opacity-5 pointer-events-none"
      />

      <Subheading className="max-w-xs sm:max-w-sm text-center">
        {cta.titleBefore}{" "}
        <span className="underline decoration-wavy decoration-orange-400">
          {cta.titleUnderlined}
        </span>{" "}
        {cta.titleAfter}
      </Subheading>

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
