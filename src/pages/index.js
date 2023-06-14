import React, { useEffect } from "react";
import { InformationCircleIcon } from "@heroicons/react/outline";
import { VideoCameraIcon } from "@heroicons/react/solid";
import { useRouter } from "next/router";
import Link from "next/link";
import { getOAuthURL } from "../utils/getOAuthURL";
import FadeIn from "react-fade-in";
import PropTypes from "prop-types";

Home.propTypes = {
  totalUsers: PropTypes.number
};

export default function Home({ totalUsers }) {
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

  const oauthURL = getOAuthURL();

  return (
    <FadeIn transitionDuration={500}>
      <div className="flex items-center justify-center h-[calc(100vh-150px)] px-10">
        <div className="relative w-full max-w-xl">
          <div className="relative">
            <p className="pb-2 -mt-12 text-4xl font-bold text-center text-transparent bg-clip-text bg-gradient-to-br from-slate-700 to-slate-500">
              Unlock your Focusmate metrics.
            </p>
            {process.env.NODE_ENV === "production" && (
              <p className="text-lg font-normal text-center text-slate-700">
                Join{" "}
                <span className="underline decoration-orange-400 decoration-wavy">
                  {totalUsers} other Focusmate users
                </span>{" "}
                and get access to your milestones, session trends, hours of
                session, and more.
              </p>
            )}
            <div className="flex justify-center mt-10 text-slate-500">
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
    </FadeIn>
  );
}

export async function getServerSideProps() {
  const response = await fetch(
    `${
      process.env.NODE_ENV === "development"
        ? process.env.NEXT_PUBLIC_DEV_URL
        : process.env.NEXT_PUBLIC_PROD_URL
    }/api/stats`
  );
  const data = await response.json();
  const totalUsers = data.totalUsers;
  return {
    props: {
      totalUsers
    }
  };
}
