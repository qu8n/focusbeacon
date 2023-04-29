import React from "react";
import GitHubButton from "react-github-btn";

export default function Footer() {
  return (
    <>
      <footer className="flex flex-col items-center pt-12 pb-12 space-y-2 text-xs border-t m-7 text-slate-400 border-slate-300">
        <GitHubButton
          href="https://github.com/qu8n/focusbeacon"
          data-size="large"
          aria-label="Star project on GitHub"
        >
          &nbsp; Star project on GitHub
        </GitHubButton>
        <p>&copy; {new Date().getFullYear()} FocusBeacon</p>
      </footer>
    </>
  );
}
