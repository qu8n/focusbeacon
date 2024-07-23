import { Footnote } from "@/components/ui/text"
import { cx } from "@/lib/utils"
import { Marquee } from "@/components/ui/marquee"
import { Subheading } from "@/components/ui/heading"
import { reviews } from "@/app/home/components/config"

const ReviewCard = ({ name, review }: { name: string; review: string }) => {
  return (
    <figure
      className={cx(
        "relative w-64 cursor-pointer overflow-hidden rounded-xl border p-4",
        // light styles
        "border-gray-950/[.1] bg-[#F3F1EB] hover:bg-gray-950/[.05]"
      )}
    >
      <div className="flex flex-row items-center gap-2">
        {/* eslint-disable-next-line @next/next/no-img-element */}
        <img
          className="rounded-full"
          width="32"
          height="32"
          alt=""
          src={`https://ui-avatars.com/api/?name=${name[0]}+${name[1][0]}}`}
        />
        <div className="flex flex-col">
          <figcaption className="text-sm">{name}</figcaption>
        </div>
      </div>
      <blockquote className="mt-2 text-sm text-stone-600">{review}</blockquote>
    </figure>
  )
}

const firstRow = reviews.reviews.slice(0, reviews.reviews.length / 2)
const secondRow = reviews.reviews.slice(reviews.reviews.length / 2)

export function Reviews() {
  return (
    <div className="relative flex h-full w-full flex-col items-center justify-center overflow-hidden rounded-lg border border-stone-300/[0.7] py-8 sm:shadow-sm bg-[#EAE7DC]">
      <Subheading className="mb-4 inline-flex items-center">
        {reviews.title}
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

      <Footnote className="mt-4">{reviews.footnote}</Footnote>

      <div className="pointer-events-none absolute inset-y-0 left-0 w-1/6 bg-gradient-to-r from-[#EAE7DC]"></div>
      <div className="pointer-events-none absolute inset-y-0 right-0 w-1/6 bg-gradient-to-l from-[#EAE7DC]"></div>
    </div>
  )
}
