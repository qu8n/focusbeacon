import React from "react";
import Logo from "../components/Logo";
import SignInButton from "../components/SignInButton";

export default function Landing() {
  return (
    <>
      <div className="h-screen bg-slate-50 flex">
        <div className="m-auto text-center">
          <Logo />
          <br />
          <SignInButton />
        </div>
      </div>
    </>
  );
}
