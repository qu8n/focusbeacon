import React from "react";

export default function SignInButton() {
  return (
    <>
      <button
        onClick={() => {
          if (typeof window !== "undefined") {
            window.location.href = `https://www.focusmate.com/oauth/authorize?client_id=${process.env.NEXT_PUBLIC_FOCUSMATE_CLIENT_ID}&response_type=code&scope=profile%20sessions`;
          }
        }}
        className="inline-flex items-center text-sm h-11 font-medium bg-blue-500 hover:bg-blue-500/[.95] text-white px-4 rounded"
      >
        <svg
          xmlns="http://www.w3.org/2000/svg"
          viewBox="0 0 20 20"
          fill="currentColor"
          className="w-5 h-5 mr-2"
        >
          <path d="M3.25 4A2.25 2.25 0 001 6.25v7.5A2.25 2.25 0 003.25 16h7.5A2.25 2.25 0 0013 13.75v-7.5A2.25 2.25 0 0010.75 4h-7.5zM19 4.75a.75.75 0 00-1.28-.53l-3 3a.75.75 0 00-.22.53v4.5c0 .199.079.39.22.53l3 3a.75.75 0 001.28-.53V4.75z" />
        </svg>
        Continue with Focusmate
      </button>
    </>
  );
}
