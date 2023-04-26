import React from "react";
import GitHubButton from "react-github-btn";

export default function Footer() {
  return (
    <>
      <footer className="flex flex-col items-center py-12 mt-4 mb-10 space-y-2 text-xs border-t text-slate-400 m-7 border-gray-900/10">
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
