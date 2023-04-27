/* eslint-disable react/no-unescaped-entities */
import React from "react";
import Link from "next/link";
import PropTypes from "prop-types";

ModalLink.propTypes = {
  text: PropTypes.string.isRequired,
  href: PropTypes.string.isRequired
};
function ModalLink({ text, href }) {
  return (
    <Link
      className="underline text-slate-500 hover:text-slate-700 hover:no-underline"
      href={href}
      target="_blank"
      rel="noreferrer"
    >
      {text}
    </Link>
  );
}

export function AboutModalContent() {
  return (
    <>
      <p>Hi there,</p>
      <p className="mt-3">
        My name is <ModalLink text="Quan" href="https://quans.org/" />. I built
        FocusBeacon to visualize my past Focusmate sessions and keep myself
        motivated. I'm hoping that you will find it useful as well.
      </p>
      <p className="mt-3">
        I plan to keep this website 100% free forever. If you want to support,
        you can{" "}
        <ModalLink
          text="buy me a coffee"
          href="https://www.buymeacoffee.com/quans"
        />{" "}
        and (if you're a software person){" "}
        <ModalLink
          text="star this project on GitHub"
          href="https://www.github.com/qu8n/focusbeacon"
        />
        .
      </p>
      <p className="mt-3">
        More stats and visuals will be added over time. If you have any
        suggestions, want to be updated, or want to cowork with me on Focusmate,
        please{" "}
        <ModalLink text="email me here" href="mailto:quanwnn@gmail.com" />.
      </p>
      <p className="mt-3">Happy focusing,</p>
      <p>Quan</p>
    </>
  );
}

export function PrivacyModalContent() {
  return (
    <>
      <p>
        FocusBeacon is committed to your privacy and doesn't store nor sell
        personal data, including IP addresses, cookies, and browsing history.
        When you sign in, you are redirected to the official Focusmate website,
        ensuring we don't access your password.
      </p>
      <p className="mt-3">
        We use your data made available to us by the official{" "}
        <ModalLink text="Focusmate API" href="https://apidocs.focusmate.com/" />{" "}
        to generate visualizations. These detailed data points are fetched each
        time you visit FocusBeacon and are not stored in our database.
        FocusBeacon only stores your Focusmate ID (a non-identifiable random
        string) and time zone to analyze the overall user demographics.
      </p>
      <p className="mt-3">
        FocusBeacon is an open-source project, which means anyone can inspect
        the code that runs this website. You can find the source code{" "}
        <ModalLink text="here" href="https://www.github.com/qu8n/focusbeacon" />
        . If you have any questions or concerns, please{" "}
        <ModalLink text="email me here" href="mailto:quanwnn@gmail.com" />.
      </p>
    </>
  );
}

export const weeklyChartTooltip =
  "Each x-axis marker represents a week, which begins on Sunday based on the Gregorian calendar";

export const monthlyChartTooltip =
  "Each x-axis marker represents a month and its respective year";
