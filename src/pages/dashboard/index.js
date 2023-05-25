import React, { Suspense } from "react";
import DashboardComponent from "../../components/Dashboard";
import LoaderSpinner from "../../components/LoaderSpinner";

export default function Dashboard() {
  return (
    <Suspense fallback={<LoaderSpinner />}>
      <DashboardComponent isDemo={false} />
    </Suspense>
  );
}
