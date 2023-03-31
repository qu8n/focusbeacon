import React from "react";
import SignInButton from "../components/SignInButton";

export default function Landing() {
  return (
    <div className="flex p-10 h-5/6 bg-no-repeat bg-center bg-[url('../../public/pie-bg.png')]">
      <div className="m-auto">
        <p className="text-center text-5xl font-bold text-slate-500">
          Unlock your Focusmate stats
        </p>
        <p className="text-center text-3xl font-normal text-slate-400">
          Build better habits & crush your goals
        </p>
        <div className="mt-5 flex justify-center">
          <SignInButton />
        </div>
        <p className="mt-2 text-center text-slate-400 text-sm">
          Tip: Sign into Focusmate from your device first
        </p>
      </div>
    </div>
  );
}
