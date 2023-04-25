/* eslint-disable no-unused-vars */
import React from "react";
import { useQuery } from "react-query";
import LoaderSpinner from "../components/LoaderSpinner";
import processData from "../utils/processData";
import "@tremor/react/dist/esm/tremor.css";
import { ColGrid } from "@tremor/react";
import SessionsByDuration from "../components/SessionsByDuration";
import LifetimeMetrics from "../components/LifetimeMetrics";
import Milestones from "../components/Milestones";
import RepeatPartners from "../components/RepeatPartners";
import TimeSeriesChart from "../components/TimeSeriesChart";
import Footer from "../components/Footer";
import {
  monthlyChartTooltip,
  weeklyChartTooltip
} from "../constants/textSnippets";

export default function Dashboard() {
  const { isLoading, isError, data, error } = useQuery({
    queryKey: ["focusmateData"],
    queryFn: async () => {
      const response = await fetch("/api/request");
      const data = await response.json();
      return data;
    }
  });

  if (isLoading) {
    return <LoaderSpinner />;
  }

  if (isError) {
    // TODO: add link for user to report error
    return <p>Error: {error.message}</p>;
  }

  const { profileData, sessionsData } = data;

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
    updateTime,
    lTWSessionsArr,
    lTWHoursArr
  ] = processData(sessionsData);

  return (
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
          <SessionsByDuration data={[sessionsByDurationArr, totalSessions]} />
          <Milestones data={milestonesArr} />
          <RepeatPartners data={repeatPartnersArr} />
        </ColGrid>
      </div>

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

      <div className="m-7">
        <Footer data={updateTime} />
      </div>
      <br />
    </>
  );
}
