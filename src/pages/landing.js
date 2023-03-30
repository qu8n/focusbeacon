import React from "react";
import SignInButton from "../components/SignInButton";

export default function Landing() {
  return (
    <>
      <p className="p-10 mt-32 text-center text-2xl font-bold text-transparent bg-clip-text bg-gradient-to-br from-slate-600 to-slate-400">
        Unlock enhanced insights into your Focusmate sessions
      </p>
      <div className="flex justify-center">
        <SignInButton />
      </div>
      <p className="mt-2 text-center text-slate-400 text-sm">
        (Please sign in on Focusmate first)
      </p>
    </>
  );
}
