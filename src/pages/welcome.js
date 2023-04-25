import React from "react";
import LandingPageButton from "../components/LandingPageButton";

export default function Welcome() {
  return (
    <div className="flex p-5 h-[calc(100vh-105px)]">
      <div className="m-auto">
        <p className="-mt-32 text-4xl font-bold text-center text-transparent bg-clip-text bg-gradient-to-br from-slate-600 to-slate-500">
          Unlock your Focusmate stats.
        </p>
        <p className="mt-2 text-xl font-normal text-center text-slate-500">
          Build better habits. Crush your goals.
        </p>
        <p className="mt-5 text-sm text-center text-slate-400">
          Tip: sign in to Focusmate before continuing
        </p>
        <div className="flex justify-center mt-2">
          <LandingPageButton
            link={`https://www.focusmate.com/oauth/authorize?client_id=${process.env.NEXT_PUBLIC_FOCUSMATE_CLIENT_ID}&response_type=code&scope=profile%20sessions`}
            icon={
              <svg
                xmlns="http://www.w3.org/2000/svg"
                viewBox="0 0 20 20"
                fill="currentColor"
                className="w-5 h-5 ml-2 mr-4"
              >
                <path d="M3.25 4A2.25 2.25 0 001 6.25v7.5A2.25 2.25 0 003.25 16h7.5A2.25 2.25 0 0013 13.75v-7.5A2.25 2.25 0 0010.75 4h-7.5zM19 4.75a.75.75 0 00-1.28-.53l-3 3a.75.75 0 00-.22.53v4.5c0 .199.079.39.22.53l3 3a.75.75 0 001.28-.53V4.75z" />
              </svg>
            }
            text="Continue with Focusmate"
            theme="inline-flex text-white bg-blue-500 hover:bg-blue-500/[.90]"
          />
        </div>
        <div className="flex justify-center mt-4">
          <LandingPageButton
            link="/demo"
            text="View Demo"
            theme="text-slate-500 hover:text-white border-2 border-slate-400 hover:border-slate-500 hover:bg-slate-500"
          />
        </div>
      </div>
    </div>
  );
}
