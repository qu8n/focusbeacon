/* eslint-disable no-unused-vars */
// import { profileData, sessionsData } from "../PRIVATE"; // ignore - mock data for testing
import React, { useState } from "react";
import { useQuery } from "react-query";
import "@tremor/react/dist/esm/tremor.css";
import { ColGrid } from "@tremor/react";
import processData from "../utils/processData";
import fetchProfileData from "../utils/fetchProfileData";
import fetchSessionsData from "../utils/fetchSessionsData";
import SessionsByDuration from "./SessionsByDuration";
import LifetimeMetrics from "./LifetimeMetrics";
import Milestones from "./Milestones";
import RepeatPartners from "./RepeatPartners";
import TimeSeriesChart from "./TimeSeriesChart";
import NavBar from "./NavBar";
import LoaderSpinner from "./LoaderSpinner";
import Footer from "./Footer";
import WelcomeMessage from "./WelcomeMessage";
import Modal from "./Modal";

export default function App() {
  const [showAboutModal, setShowAboutModal] = useState(false);
  const [showPrivacyModal, setShowPrivacyModal] = useState(false);

  const {
    isLoading: profileIsLoading,
    isError: profileIsError,
    data: profileData,
    error: profileError
  } = useQuery("profileData", fetchProfileData);

  const {
    isLoading: sessionsIsLoading,
    isError: sessionsIsError,
    data: sessionsData,
    error: sessionsError
  } = useQuery("sessionsData", fetchSessionsData);

  if (profileIsLoading || sessionsIsLoading) {
    return (
      <div className="loader-center">
        <LoaderSpinner />
      </div>
    );
  }

  if (profileIsError || sessionsIsError) {
    return (
      <>
        <p>Profile data error: {profileError.message}</p>
        <p>Sessions data error: {sessionsError.message}</p>
      </>
    );
  }

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

  const weeklyChartTooltip =
    "Each x-axis marker represents a week, which begins on Sunday based on the Gregorian calendar";

  const monthlyChartTooltip =
    "Each x-axis marker represents a month and its respective year";

  return (
    <div className="background-color">
      <NavBar
        data={profileData.user}
        setShowAboutModal={setShowAboutModal}
        setShowPrivacyModal={setShowPrivacyModal}
      />

      {(showAboutModal || showPrivacyModal) && (
        <Modal
          modalType={showAboutModal ? "about" : "privacy"}
          setShowAboutModal={setShowAboutModal}
          setShowPrivacyModal={setShowPrivacyModal}
        />
      )}

      <div className="row-margin">
        <WelcomeMessage />
      </div>

      <div className="row-margin">
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
      <br />
    </div>
  );
}
