import React from "react";
import Dashboard from "../../components/Dashboard";
import { ExclamationIcon } from "@heroicons/react/outline";

export default function Demo() {
  return (
    <>
      <div className="p-4 border border-l-4 border-yellow-400 m-7 bg-yellow-50">
        <div className="flex">
          <div className="flex-shrink-0">
            <ExclamationIcon
              className="w-5 h-5 text-yellow-400"
              aria-hidden="true"
            />
          </div>
          <div className="ml-3">
            <p className="text-sm text-yellow-700">
              This dashboard is for demo purposes only. Log in to view your own
              stats.
            </p>
          </div>
        </div>
      </div>
      <Dashboard isDemo={true} />
    </>
  );
}
