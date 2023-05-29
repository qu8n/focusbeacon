import React from "react";
import GitHubButton from "react-github-btn";
import PropTypes from "prop-types";

Footer.propTypes = {
  today: PropTypes.instanceOf(Date).isRequired
};

export default function Footer({ today }) {
  return (
    <>
      <footer className="flex flex-col items-center pt-12 pb-12 mx-3 mt-10 space-y-2 text-xs border-t sm:mx-20 text-slate-400 border-slate-300">
        <GitHubButton
          href="https://github.com/qu8n/focusbeacon"
          data-size="large"
          aria-label="Star project on GitHub"
        >
          &nbsp; Star project on GitHub
        </GitHubButton>
        <p>&copy; {today.getFullYear()} FocusBeacon</p>
      </footer>
    </>
  );
}
