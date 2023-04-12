import React from "react";
import SignInButton from "../components/SignInButton";

export default function Landing() {
  return (
    <div className="flex p-5 h-[calc(100vh-105px)]">
      <div className="m-auto">
        <p className="-mt-28 text-center text-5xl font-bold text-slate-500">
          Unlock your Focusmate stats
        </p>
        <p className="mt-1 text-center text-3xl font-normal text-slate-400">
          Build better habits & crush your goals
        </p>
        <div className="mt-8 flex justify-center">
          <SignInButton />
        </div>
        <p className="mt-1 text-center text-slate-400 text-sm">
          Tip: sign in to Focusmate before continuing
        </p>
      </div>
    </div>
  );
}
