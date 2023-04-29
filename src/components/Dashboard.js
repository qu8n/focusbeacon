import React, { useState } from "react";
import { useQuery } from "react-query";
import LoaderSpinner from "./LoaderSpinner";
import processData from "../utils/processData";
import "@tremor/react/dist/esm/tremor.css";
import { ColGrid } from "@tremor/react";
import SessionsByDuration from "./dashboard/SessionsByDuration";
import LifetimeMetrics from "./dashboard/LifetimeMetrics";
import Milestones from "./dashboard/Milestones";
import RepeatPartners from "./dashboard/RepeatPartners";
import TimeSeriesChart from "./dashboard/TimeSeriesChart";
import {
  monthlyChartTooltip,
  weeklyChartTooltip
} from "../constants/textSnippets";
import PropTypes from "prop-types";
import { useRouter } from "next/router";
import Footer from "./Footer";

function classNames(...classes) {
  return classes.filter(Boolean).join(" ");
}

Dashboard.propTypes = {
  isDemo: PropTypes.bool.isRequired
};

export default function Dashboard({ isDemo }) {
  const [currentTab, setCurrentTab] = useState("Weekly");
  const router = useRouter();
  const isDemoFlag = "isDemo=" + (isDemo ? "true" : "false");

  // Fetch data from Focusmate API using TanStack Query through /api/request
  // Notable defaults: cacheTime = 5 minutes, refetchOnWindowFocus = true
  const { isLoading, isError, data, error } = useQuery({
    queryKey: ["focusmateData"],
    queryFn: async () => {
      const response = await fetch(`/api/request?${isDemoFlag}`);
      if (response.status !== 200 && typeof window !== "undefined") {
        router.push("/");
      }
      const data = await response.json();
      return data;
    }
  });

  // Handle loading and error states
  if (isLoading) {
    return <LoaderSpinner />;
  }

  if (isError) {
    return <p>Error: {error.message}</p>;
  }

  // Process data and render dashboard
  // eslint-disable-next-line no-unused-vars
  const { profileData, sessionsData } = data;

  if (sessionsData) {
    const [
      totalSessions,
      totalHours,
      totalPartners,
      firstSessionDate,
      maxHoursADay,
      sessionsByDurationArr,
      milestonesArr,
      repeatPartnersArr,
      lTMSessionsArr,
      lTMHoursArr,
      lTWSessionsArr,
      lTWHoursArr
    ] = processData(sessionsData);

    return (
      <>
        <div className="pb-5 border-b border-slate-300 m-7">
          <p className="mb-2 text-lg font-medium text-slate-800">
            Select a view:
          </p>
          <nav className="space-x-2 sm:space-x-4" aria-label="Tabs">
            {["Weekly", "Monthly", "Yearly", "Lifetime"].map((tab) => (
              <button
                key={tab}
                onClick={() => setCurrentTab(tab)}
                className={classNames(
                  tab === currentTab
                    ? "bg-blue-100 text-blue-600 ring-blue-500 ring-2"
                    : "text-slate-500 hover:text-slate-700 hover:bg-slate-200 ring-slate-300 ring-1 hover:ring-2",
                  "rounded-md px-4 py-2 text-sm font-medium"
                )}
              >
                {tab}
              </button>
            ))}
          </nav>
        </div>

        {currentTab === "Weekly" && (
          <div className="m-7">
            <ColGrid numColsLg={2} gapX="gap-x-6" gapY="gap-y-6">
              <TimeSeriesChart
                chartType="bar"
                title="Sessions by week"
                data={lTWSessionsArr}
                dataKey="Week of"
                categories={["Number of Sessions"]}
                tooltip={weeklyChartTooltip}
              />
              <TimeSeriesChart
                chartType="area"
                title="Hours of sessions by week"
                data={lTWHoursArr}
                dataKey="Week of"
                categories={["Hours of Sessions"]}
                tooltip={weeklyChartTooltip}
              />
            </ColGrid>
          </div>
        )}

        {currentTab === "Monthly" && (
          <div className="m-7">
            <ColGrid numColsLg={2} gapX="gap-x-6" gapY="gap-y-6">
              <TimeSeriesChart
                chartType="bar"
                title="Sessions by month"
                data={lTMSessionsArr}
                dataKey="Month"
                categories={["Number of Sessions"]}
                tooltip={monthlyChartTooltip}
              />
              <TimeSeriesChart
                chartType="area"
                title="Hours of sessions by month"
                data={lTMHoursArr}
                dataKey="Month"
                categories={["Hours of Sessions"]}
                tooltip={monthlyChartTooltip}
              />
            </ColGrid>
          </div>
        )}

        {currentTab === "Lifetime" && (
          <>
            <div className="m-7">
              <LifetimeMetrics
                data={[
                  totalSessions,
                  totalHours,
                  totalPartners,
                  firstSessionDate,
                  maxHoursADay
                ]}
              />
            </div>

            <div className="m-7">
              <ColGrid numColsLg={3} gapX="gap-x-6" gapY="gap-y-6">
                <SessionsByDuration
                  data={[sessionsByDurationArr, totalSessions]}
                />
                <Milestones data={milestonesArr} />
                <RepeatPartners data={repeatPartnersArr} />
              </ColGrid>
            </div>
          </>
        )}

        <Footer />
      </>
    );
  }
}
