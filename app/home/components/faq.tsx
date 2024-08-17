"use client"

import {
  Accordion,
  AccordionContent,
  AccordionItem,
  AccordionTrigger,
} from "@/components/ui/accordion"
import { Subheading } from "@/components/ui/heading"
import { LinkInternal } from "@/components/ui/link-internal"
import { ReactNode } from "react"

const faq: { question: string; answer: string | ReactNode }[] = [
  {
    question: "Are you affiliated with Focusmate?",
    answer: (
      <section className="space-y-2">
        <p>Focusbeacon is an unofficial service for Focusmate users.</p>
        <p>
          However, the Focusbeacon app and our sign-in flow were built in close
          collaboration with a Focusmate software engineer (shoutout to David).
        </p>
        <p>
          We are also the first ever non-commercial service to be granted the{" "}
          <i>Sign in with Focusmate</i> feature by the Focusmate team.
        </p>
      </section>
    ),
  },
  {
    question: "How much does this cost?",
    answer: (
      <p>
        Focusbeacon is 100% free to use, forever. Please refer to our{" "}
        <LinkInternal href="/about" className="underline">
          About page
        </LinkInternal>{" "}
        for more information.
      </p>
    ),
  },
  {
    question: "What is your privacy policy?",
    answer: (
      <p>
        Focusbeacon does not store nor sell your personal data. Please refer to
        our{" "}
        <LinkInternal href="/privacy" className="underline">
          Privacy page
        </LinkInternal>{" "}
        for more information.
      </p>
    ),
  },
]

export function FAQ() {
  return (
    <div className="flex flex-col gap-4">
      <Subheading className="inline-flex items-center mx-auto">
        Frequently asked questions
      </Subheading>

      <Accordion type="multiple" className="mx-auto w-4/5 sm:w-2/3">
        {faq.map((item, index) => (
          <AccordionItem value={`item-${index}`} key={index}>
            <AccordionTrigger>{item.question}</AccordionTrigger>
            <AccordionContent>{item.answer}</AccordionContent>
          </AccordionItem>
        ))}
      </Accordion>
    </div>
  )
}
