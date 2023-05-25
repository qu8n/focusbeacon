import React, { Suspense } from "react";
import DashboardComponent from "../../components/Dashboard";
import LoaderSpinner from "../../components/LoaderSpinner";
import { ExclamationIcon } from "@heroicons/react/outline";
import Link from "next/link";
import { getOAuthURL } from "../../utils/getOAuthURL";

export default function Demo() {
  const oauthURL = getOAuthURL();

  return (
    <Suspense fallback={<LoaderSpinner />}>
      <div className="p-4 mx-3 mb-10 border border-l-4 border-yellow-400 sm:mx-20 bg-yellow-50">
        <div className="flex">
          <div className="flex-shrink-0">
            <ExclamationIcon
              className="w-5 h-5 text-yellow-400"
              aria-hidden="true"
            />
          </div>
          <div className="ml-3">
            <p className="text-sm text-yellow-700">
              This dashboard is for demo purposes only.{" "}
              <Link
                href={oauthURL}
                className="text-yellow-600 underline hover:no-underline hover:text-yellow-700"
              >
                Log in
              </Link>{" "}
              to view your own stats.
            </p>
          </div>
        </div>
      </div>
      <DashboardComponent isDemo={true} />
    </Suspense>
  );
}
