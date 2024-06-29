/* eslint-disable @next/next/no-img-element */
import { cx } from "@/lib/utils"
import { Marquee } from "@/components/ui/marquee"
import { Subheading } from "@/components/ui/heading"
import reviews from "@/app/home/reviews.json"
import { Footnote } from "../ui/text"

const firstRow = reviews.slice(0, reviews.length / 2)
const secondRow = reviews.slice(reviews.length / 2)

const ReviewCard = ({ name, review }: { name: string; review: string }) => {
  return (
    <figure
      className={cx(
        "relative w-64 cursor-pointer overflow-hidden rounded-xl border p-4",
        // light styles
        "border-gray-950/[.1] bg-gray-950/[.01] hover:bg-gray-950/[.05]",
        // dark styles
        "dark:border-gray-50/[.1] dark:bg-gray-50/[.10] dark:hover:bg-gray-50/[.15]"
      )}
    >
      <div className="flex flex-row items-center gap-2">
        <img
          className="rounded-full"
          width="32"
          height="32"
          alt=""
          src={`https://ui-avatars.com/api/?name=${name[0]}+${name[1][0]}}`}
        />
        <div className="flex flex-col">
          <figcaption className="text-sm dark:text-white">{name}</figcaption>
        </div>
      </div>
      <blockquote className="mt-2 text-sm text-zinc-600">{review}</blockquote>
    </figure>
  )
}

export function Reviews() {
  return (
    <div className="relative flex h-full w-full flex-col items-center justify-center overflow-hidden rounded-lg border py-8 sm:shadow-sm">
      <Subheading className="mb-4 inline-flex items-center">
        Loved by Focusmate members 🧡
      </Subheading>

      <Marquee pauseOnHover className="[--duration:50s]">
        {firstRow.map((review) => (
          <ReviewCard key={review.name} {...review} />
        ))}
      </Marquee>

      <Marquee reverse pauseOnHover className="[--duration:55s]">
        {secondRow.map((review) => (
          <ReviewCard key={review.name} {...review} />
        ))}
      </Marquee>

      <Footnote className="mt-4">
        Source: Focusmate&apos;s Facebook group
      </Footnote>

      <div className="pointer-events-none absolute inset-y-0 left-0 w-1/6 bg-gradient-to-r from-white dark:from-background"></div>
      <div className="pointer-events-none absolute inset-y-0 right-0 w-1/6 bg-gradient-to-l from-white dark:from-background"></div>
    </div>
  )
}
