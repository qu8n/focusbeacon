import React, { useEffect, useState } from "react";
import { InformationCircleIcon } from "@heroicons/react/outline";
import { VideoCameraIcon } from "@heroicons/react/solid";
import { useRouter } from "next/router";
import Link from "next/link";
import { getOAuthURL } from "../utils/getOAuthURL";
import FadeIn from "react-fade-in";
import Image from "next/image";

export default function Home() {
  const router = useRouter();
  const [totalUsers, setTotalUsers] = useState(null);

  useEffect(() => {
    async function checkSignedInStatus() {
      const response = await fetch("/api/session");
      const data = await response.json();
      if (data.signedIn) {
        router.push("/dashboard");
      }
    }
    checkSignedInStatus();

    async function getStats() {
      const response = await fetch("/api/stats");
      const data = await response.json();
      setTimeout(() => {
        setTotalUsers(data.totalUsers);
      }, 1000);
    }
    getStats();
  }, []);

  const oauthURL = getOAuthURL();

  return (
    <>
      <div className="flex items-center justify-center px-10 mt-32">
        <div className="relative w-full max-w-xl">
          <div className="relative">
            <p className="pb-2 -mt-12 text-4xl font-bold text-center text-transparent bg-clip-text bg-gradient-to-br from-slate-700 to-slate-500">
              Unlock your Focusmate metrics
            </p>
            <div className="flex justify-center mt-3 text-slate-500">
              <InformationCircleIcon
                className="w-4 h-4 mr-1"
                aria-hidden="true"
              />
              <span className="text-xs w-72">
                Log into Focusmate first before logging in here
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
            {totalUsers && (
              <FadeIn transitionDuration={500}>
                <p className="mt-5 text-xl font-normal text-center lg:px-10 text-slate-500">
                  Join{" "}
                  <span className="underline decoration-orange-400 decoration-wavy">
                    {totalUsers} Focusmate users
                  </span>{" "}
                  and get access to your milestones, session trends, hours of
                  session, and more.
                </p>
              </FadeIn>
            )}
          </div>
        </div>
      </div>
      <div className="flex justify-center mt-10 sneakpeek">
        <Image src="/sneakpeek.png" width={1200} height={1200} />
      </div>
    </>
  );
}
