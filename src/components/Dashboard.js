import React from "react";
import { useQuery } from "react-query";
import LoaderSpinner from "./LoaderSpinner";
import processData from "../utils/processData";
import "@tremor/react/dist/esm/tremor.css";
import { ColGrid } from "@tremor/react";
import SessionsByDuration from "./SessionsByDuration";
import LifetimeMetrics from "./LifetimeMetrics";
import Milestones from "./Milestones";
import RepeatPartners from "./RepeatPartners";
import TimeSeriesChart from "./TimeSeriesChart";
import Footer from "./Footer";
import {
  monthlyChartTooltip,
  weeklyChartTooltip
} from "../constants/textSnippets";
import PropTypes from "prop-types";
import { useRouter } from "next/router";

Dashboard.propTypes = {
  isDemo: PropTypes.bool.isRequired
};

export default function Dashboard({ isDemo }) {
  const router = useRouter();

  const isDemoFlag = "isDemo=" + (isDemo ? "true" : "false");

  const { isLoading, isError, data, error } = useQuery({
    queryKey: ["focusmateData"],
    queryFn: async () => {
      const response = await fetch(`/api/request?${isDemoFlag}`);
      if (response.status !== 200 && typeof window !== "undefined") {
        router.push("/welcome");
      }
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
}
