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
    <Link className="text-slate-500 hover:text-slate-700" href={href}>
      {text}
    </Link>
  );
}

export function AboutModalContent() {
  return (
    <>
      <p>🙂 Hi there!</p>
      <p className="mt-3">
        If you're here, I assume that you're a{" "}
        <ModalLink text="Focusmate" href="https://www.focusmate.com/" /> fan
        like me. My name is <ModalLink text="Quan" href="https://quans.org/" />,
        and I built this website because I'm a stats nerd who wanted to
        visualize my past Focusmate sessions and keep myself motivated. I'm
        hoping that you will find it useful as well.
      </p>
      <p className="mt-3">
        I'm hoping to keep this website 100% free forever. If you enjoy this
        website and want to support, please consider{" "}
        <ModalLink
          text="buying me a coffee"
          href="https://www.buymeacoffee.com/quans"
        />{" "}
        and (if you're a software person){" "}
        <ModalLink
          text="starring my project on GitHub"
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
      <p className="mt-3">Cheers,</p>
      <p>Quan</p>
    </>
  );
}

export const privacyModalContent =
  "Privacy: Lorem ipsum dolor sit amet, consectetur adipiscing elit, sed do eiusmod tempor incididunt ut labore et dolore magna aliqua. Ut enim ad minim veniam, quis nostrud exercitation ullamco laboris nisi ut aliquip ex ea commodo consequat. Duis aute irure dolor in reprehenderit in voluptate velit esse cillum dolore eu fugiat nulla pariatur. Excepteur sint occaecat cupidatat non proident, sunt in culpa qui officia deserunt mollit anim id est laborum.";

export const weeklyChartTooltip =
  "Each x-axis marker represents a week, which begins on Sunday based on the Gregorian calendar";

export const monthlyChartTooltip =
  "Each x-axis marker represents a month and its respective year";
