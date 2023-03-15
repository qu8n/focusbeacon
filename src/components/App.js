/* eslint-disable no-unused-vars */
import "../styles/index.css";
import SessionsByDuration from "./SessionsByDuration";
import LifetimeMetrics from "./LifetimeMetrics";
import "@tremor/react/dist/esm/tremor.css";
import Milestones from "./Milestones";
import { ColGrid } from "@tremor/react";
import useProcessData from "../hooks/useProcessData";
import RepeatPartners from "./RepeatPartners";
import TimeSeriesChart from "./TimeSeriesChart";
import NavBar from "./NavBar";
import LoaderSpinner from "./LoaderSpinner";
import Footer from "./Footer";
import WelcomeMessage from "./WelcomeMessage";
import React from "react";
import useFetchData from "../hooks/useFetchData";

import { useQuery, useQueryClient } from 'react-query';
import fetchProfileData from '../utils/fetchProfileData';

export default function App() {
  // const [loading, profileData, sessionsData] = useFetchData();

  // const [
  //   totalSessions,
  //   totalHours,
  //   totalPartners,
  //   firstSessionDate,
  //   maxHoursADay,
  //   sessionsByDurationArr,
  //   milestonesArr,
  //   repeatPartnersArr,
  //   lTMSessionsArr,
  //   lTMHoursArr,
  //   updateTime,
  //   lTWSessionsArr,
  //   lTWHoursArr,
  // ] = useProcessData(sessionsData);

  // const weeklyChartTooltip =
  //   "Each x-axis marker represents a week, which begins on Sunday based on the Gregorian calendar";
  // const monthlyChartTooltip =
  //   "Each x-axis marker represents a month and its respective year";
  
  const queryClient = useQueryClient();
  const { isLoading: profileIsLoading, isError: profileIsError, data: profileData , error: profileError } = useQuery('profileData', fetchProfileData);

  if (profileIsLoading) {
    return (
      <div className="loader-center">
        <LoaderSpinner />
      </div>
    );
  }
  
  if (profileIsError) {
    return <span>Profile data error: {profileError.message}</span>
  } 
  
  // else {
    return (
      <div className="background-color">
        <NavBar data={profileData.user} />

        {/* <div className="row-margin">
          <WelcomeMessage />
        </div>

        <div className="row-margin">
          <LifetimeMetrics
            data={[
              totalSessions,
              totalHours,
              totalPartners,
              firstSessionDate,
              maxHoursADay,
            ]}
          />
        </div>

        <div className="row-margin">
          <ColGrid numColsLg={3} gapX="gap-x-6" gapY="gap-y-6">
            <SessionsByDuration data={[sessionsByDurationArr, totalSessions]} />
            <Milestones data={milestonesArr} />
            <RepeatPartners data={repeatPartnersArr} />
          </ColGrid>
        </div>

        <div className="row-margin">
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

        <div className="row-margin">
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

        <div className="row-margin">
          <Footer data={updateTime} />
        </div>
        <br /> */}
      </div>
    );
  // }
}
