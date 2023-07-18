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
      <p>Hey there,</p>
      <p className="mt-3">
        I'm Quan, the creator of FocusBeacon. I built this website because I'm a
        data nerd, and I find seeing my progress in numbers and charts to be
        very motivating. I hope it works the same magic for you, too.
      </p>
      <p className="mt-3">
        This website will be 100% free forever. If you want to support, please
        let others know about this website and let me know{" "}
        <ModalLink text="here" href="https://forms.gle/mcuSkyP5uguV7FKd7" /> if
        you encounter any bugs or have any suggestions.
      </p>
      <p className="mt-3">
        If you're a software person, I'd appreciate a GitHub star or
        contribution to{" "}
        <ModalLink
          text="this project"
          href="https://www.github.com/qu8n/focusbeacon"
        />
        .
      </p>
      <p className="mt-3">Enjoy!</p>
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
        .
      </p>
    </>
  );
}
