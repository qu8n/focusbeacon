import React, { useEffect } from "react";
import { InformationCircleIcon } from "@heroicons/react/outline";
import { VideoCameraIcon } from "@heroicons/react/solid";
import { useRouter } from "next/router";
import Link from "next/link";
import { oauthURL } from "../constants/oauthURL";

export default function Home() {
  const router = useRouter();
  useEffect(() => {
    async function checkSignedInStatus() {
      const response = await fetch("/api/session");
      const data = await response.json();
      if (data.signedIn) {
        router.push("/dashboard");
      }
    }
    checkSignedInStatus();
  }, []);

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
          <div className="flex justify-center mt-10 text-slate-500">
            <InformationCircleIcon
              className="w-4 h-4 mr-1"
              aria-hidden="true"
            />
            <span className="text-xs tracking-tighter w-72">
              Log into Focusmate first before logging into this website
            </span>
          </div>
          <div className="flex justify-center">
            <Link
              href={oauthURL}
              className="flex items-center justify-center h-16 py-3 mt-2 mb-2 mr-2 text-lg font-medium text-center text-white rounded-lg bg-gradient-to-r from-blue-500 to-blue-600 hover:bg-gradient-to-br focus:ring-4 focus:outline-none focus:ring-blue-300 w-80"
            >
              <VideoCameraIcon className="w-6 h-6 mr-3" aria-hidden="true" />
              Log in with Focusmate
            </Link>
          </div>
          <div className="flex justify-center mt-4 text-lg font-semibold text-slate-700 hover:text-slate-500">
            <Link href="/dashboard/demo">
              View demo
              <span aria-hidden="true" className="ml-1">
                →
              </span>
            </Link>
          </div>
        </div>
      </div>
    </div>
  );
}
