import React from "react";
import { InformationCircleIcon } from "@heroicons/react/outline";
import Link from "next/link";

export default function Welcome() {
  return (
    <div className="flex items-center justify-center h-[calc(100vh-150px)] px-10">
      <div className="relative w-full max-w-xl">
        <div className="absolute bg-orange-300 rounded-full -bottom-10 opacity-30 -left-16 w-96 h-96 mix-blend-multiply filter blur-xl animate-blob"></div>
        <div className="absolute bg-yellow-200 rounded-full opacity-30 -right-16 w-72 h-72 mix-blend-multiply filter blur-xl animate-blob animation-delay-2000"></div>
        <div className="relative">
          <p className="pb-2 -mt-12 text-4xl font-bold text-center text-transparent bg-clip-text bg-gradient-to-br from-slate-700 to-slate-500">
            Unlock your Focusmate stats.
          </p>
          <p className="font-normal tracking-tight text-center text-md text-slate-700">
            View your milestones, session trends, hours of session, and more.
          </p>
          <div className="flex justify-center mt-10 text-slate-600">
            <InformationCircleIcon
              className="w-4 h-4 mr-1"
              aria-hidden="true"
            />
            <span className="text-xs tracking-tighter w-72">
              Log into Focusmate first before you log into this website
            </span>
          </div>
          <div className="flex justify-center">
            <button className="flex justify-center mt-2 w-80 items-center text-center text-lg h-14 font-normal px-3 rounded text-white bg-blue-500 hover:bg-blue-500/[.90]">
              <svg
                xmlns="http://www.w3.org/2000/svg"
                viewBox="0 0 20 20"
                fill="currentColor"
                className="w-5 h-5 mr-3"
              >
                <path d="M3.25 4A2.25 2.25 0 001 6.25v7.5A2.25 2.25 0 003.25 16h7.5A2.25 2.25 0 0013 13.75v-7.5A2.25 2.25 0 0010.75 4h-7.5zM19 4.75a.75.75 0 00-1.28-.53l-3 3a.75.75 0 00-.22.53v4.5c0 .199.079.39.22.53l3 3a.75.75 0 001.28-.53V4.75z" />
              </svg>
              <Link
                href={`https://www.focusmate.com/oauth/authorize?client_id=${process.env.NEXT_PUBLIC_FOCUSMATE_CLIENT_ID}&response_type=code&scope=profile%20sessions`}
              >
                Log in with Focusmate
              </Link>
            </button>
          </div>
          <div className="flex justify-center mt-4 text-lg font-semibold hover:space-x-2 text-slate-700 hover:text-slate-500">
            <a href="/demo">View Demo</a>
            <span aria-hidden="true" className="ml-1">
              →
            </span>
          </div>
        </div>
      </div>
    </div>
  );
}
