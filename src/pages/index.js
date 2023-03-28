/* eslint-disable no-unused-vars */
// import { profileData, sessionsData } from "../PRIVATE"; // ignore - mock data for testing
import React, { useState } from "react";
import { useQuery } from "react-query";
import "@tremor/react/dist/esm/tremor.css";
import { ColGrid } from "@tremor/react";
import processData from "../utils/processData";
import fetchProfileData from "../utils/fetchProfileData";
import fetchSessionsData from "../utils/fetchSessionsData";
import SessionsByDuration from "../components/SessionsByDuration";
import LifetimeMetrics from "../components/LifetimeMetrics";
import Milestones from "../components/Milestones";
import RepeatPartners from "../components/RepeatPartners";
import TimeSeriesChart from "../components/TimeSeriesChart";
import NavBar from "../components/NavBar";
import LoaderSpinner from "../components/LoaderSpinner";
import Footer from "../components/Footer";
import WelcomeMessage from "../components/WelcomeMessage";
import Modal from "../components/Modal";

export default function App() {
  const [showAboutModal, setShowAboutModal] = useState(false);
  const [showPrivacyModal, setShowPrivacyModal] = useState(false);

  const {
    isLoading: profileIsLoading,
    isError: profileIsError,
    data: profileData,
    error: profileError
  } = useQuery({
    queryKey: ["profileData"],
    queryFn: fetchProfileData
  });

  const memberSince = profileData?.user?.memberSince;

  const {
    isLoading: sessionsIsLoading,
    isError: sessionsIsError,
    data: sessionsData,
    error: sessionsError
  } = useQuery({
    // if queryFn depends on a var, include it in queryKey (per docs)
    queryKey: ["sessionsData", memberSince],
    queryFn: () => fetchSessionsData(memberSince),
    enabled: !!memberSince
  });

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

  const weeklyChartTooltip =
    "Each x-axis marker represents a week, which begins on Sunday based on the Gregorian calendar";

  const monthlyChartTooltip =
    "Each x-axis marker represents a month and its respective year";

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
    <div className="bg-slate-50">
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

      <div className="m-7">
        <WelcomeMessage />
      </div>

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
    </div>
  );
}
