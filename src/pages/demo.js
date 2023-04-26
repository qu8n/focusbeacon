import React from "react";
import Dashboard from "../components/Dashboard";
import { Callout } from "@tremor/react";
import { ExclamationIcon } from "@heroicons/react/outline";

export default function Demo() {
  return (
    <>
      <div className="border rounded-lg m-7">
        <Callout
          title="Demo"
          icon={ExclamationIcon}
          text="This dashboard is for demo purposes only. Please log in to see your own data."
          color="yellow"
        />
      </div>
      <Dashboard isDemo={true} />
    </>
  );
}
