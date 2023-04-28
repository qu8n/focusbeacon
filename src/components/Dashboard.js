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
import { TabList, Tab } from "@tremor/react";
import { SupportIcon, ClockIcon, CalendarIcon } from "@heroicons/react/solid";

Dashboard.propTypes = {
  isDemo: PropTypes.bool.isRequired
};

export default function Dashboard({ isDemo }) {
  const [tab, setTab] = useState("lifetime");
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
        <div className="m-7">
          <TabList defaultValue="lifetime" onValueChange={setTab}>
            <Tab value="lifetime" text="Lifetime" icon={SupportIcon} />
            <Tab value="weekly" text="Weekly" icon={ClockIcon} />
            <Tab value="monthly" text="Monthly" icon={CalendarIcon} />
          </TabList>
        </div>

        {tab === "lifetime" && (
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

        {tab === "weekly" && (
          <div className="m-7">
            <ColGrid numColsLg={2} gapX="gap-x-6" gapY="gap-y-6">
              <TimeSeriesChart
                chartType="bar"
                title="Sessions by Week"
                data={lTWSessionsArr}
                dataKey="Week of"
                categories={["Number of Sessions"]}
                tooltip={weeklyChartTooltip}
              />
              <TimeSeriesChart
                chartType="area"
                title="Hours of Sessions by Week"
                data={lTWHoursArr}
                dataKey="Week of"
                categories={["Hours of Sessions"]}
                tooltip={weeklyChartTooltip}
              />
            </ColGrid>
          </div>
        )}

        {tab === "monthly" && (
          <div className="m-7">
            <ColGrid numColsLg={2} gapX="gap-x-6" gapY="gap-y-6">
              <TimeSeriesChart
                chartType="bar"
                title="Sessions by Month"
                data={lTMSessionsArr}
                dataKey="Month"
                categories={["Number of Sessions"]}
                tooltip={monthlyChartTooltip}
              />
              <TimeSeriesChart
                chartType="area"
                title="Hours of Sessions by Month"
                data={lTMHoursArr}
                dataKey="Month"
                categories={["Hours of Sessions"]}
                tooltip={monthlyChartTooltip}
              />
            </ColGrid>
          </div>
        )}

        <Footer />
      </>
    );
  }
}
