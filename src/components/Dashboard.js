import React, { useState, useEffect } from "react";
import { useQuery } from "react-query";
import { useRouter } from "next/router";
import { BarChart, Card, Grid, Text, Title } from "@tremor/react";
import { LoaderSpinner } from "./LoaderSpinner";
import Footer from "./Footer";
import { Heading } from "./dashboard/Heading";
import { groupDataByInterval } from "../utils/groupDataByInterval";
import { calcTotalMetrics } from "../utils/calcTotalMetrics";
import { TotalMetrics } from "./dashboard/TotalMetrics";
import {
  currWeekDateRange,
  prevWeeksDateRange,
  currMonthDateRange,
  prevMonthsDateRange,
  currYearDateRange,
  prevYearDateRange
} from "../utils/getDateRanges";
import { buildPieData } from "../utils/buildPieData";
import { PieCharts } from "./dashboard/PieCharts";
import {
  createCurrWkChartData,
  createPrevWksChartData,
  createPrevMsChartData,
  createCurrMChartData,
  createYTDChartData,
  createPrevYChartData
} from "../utils/buildChartData";
import { SessionsAndHours } from "./dashboard/SessionsAndHours";
import { LifetimeMetrics } from "./dashboard/LifetimeMetrics";
import { RepeatPartners } from "./dashboard/RepeatPartners";
import { RecentMilestones } from "./dashboard/RecentMilestones";
import PropTypes from "prop-types";

function classNames(...classes) {
  return classes.filter(Boolean).join(" ");
}

const cardPadding = "mx-3 space-y-3 sm:mx-20 sm:space-y-7";

Dashboard.propTypes = {
  isDemo: PropTypes.bool.isRequired
};

export default function Dashboard({ isDemo }) {
  const [currentTab, setCurrentTab] = useState("Weekly");
  const router = useRouter();
  const isDemoFlag = "isDemo=" + (isDemo ? "true" : "false");

  useEffect(() => {
    async function checkSignedInStatus() {
      const response = await fetch("/api/session");
      const data = await response.json();
      if (!data.signedIn) {
        router.push("/");
      }
    }
    if (!isDemo) {
      checkSignedInStatus();
    }
  }, []);

  // Notable defaults: cacheTime = 5 minutes, refetchOnWindowFocus = true
  const { isLoading, isError, data, error } = useQuery({
    queryKey: ["focusmateData"],
    queryFn: async () => {
      const response = await fetch(`/api/request?${isDemoFlag}`);
      const data = await response.json();
      return data;
    }
  });

  if (isError) {
    return <p>Error: {error.message}</p>;
  }

  if (isLoading || !data) {
    return <LoaderSpinner />;
  }

  if (data.profileData && data.sessionsData) {
    const { profileData, sessionsData } = data;

    if (profileData.user.totalSessionCount === 0) {
      return (
        <div className="flex flex-col items-center justify-center h-[calc(100vh-150px)]">
          <Text className="text-lg text-center">
            Nothing to see here. Check back after you have had a session 🙂
          </Text>
        </div>
      );
    }

    const today = new Date();

    const {
      currWeekData,
      prevWeeksData,
      currMonthData,
      prevMonthsData,
      currYearData,
      prevYearData
    } = groupDataByInterval(sessionsData, today);

    const {
      totalSessions: prevWeeksTotalSessions,
      totalHours: prevWeeksTotalHours,
      totalPartners: prevWeeksTotalPartners
    } = calcTotalMetrics(prevWeeksData);

    const {
      totalSessions: prevMonthsTotalSessions,
      totalHours: prevMonthsTotalHours,
      totalPartners: prevMonthsTotalPartners
    } = calcTotalMetrics(prevMonthsData);

    const {
      totalSessions: prevYearTotalSessions,
      totalHours: prevYearTotalHours,
      totalPartners: prevYearTotalPartners
    } = calcTotalMetrics(prevYearData);

    const {
      totalSessions: lifetimeTotalSessions,
      totalHours: lifetimeTotalHours,
      totalPartners: lifetimeTotalPartners
    } = calcTotalMetrics(sessionsData);

    return (
      <>
        <div className="pb-5 mx-3 mb-10 border-b border-slate-300 sm:mx-20">
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

        <div className={cardPadding}>
          {currentTab === "Weekly" && (
            <>
              <Heading
                title="Current week"
                subtitle={currWeekDateRange(today)}
              />

              <TotalMetrics data={calcTotalMetrics(currWeekData)} />

              <Card>
                <Title>Sessions by day</Title>
                <BarChart
                  data={createCurrWkChartData(currWeekData)}
                  index="weekDay"
                  categories={["Total sessions"]}
                  colors={["blue"]}
                  yAxisWidth={32}
                  allowDecimals={false}
                />
                <Text className="text-center">Day of the current week</Text>
              </Card>

              <br />

              <Heading
                title="Previous 4 weeks"
                subtitle={prevWeeksDateRange(today)}
              />

              <TotalMetrics
                data={{
                  totalSessions: prevWeeksTotalSessions,
                  totalHours: prevWeeksTotalHours,
                  totalPartners: prevWeeksTotalPartners
                }}
              />

              <PieCharts
                data={buildPieData(prevWeeksData)}
                totalSessions={prevWeeksTotalSessions}
                grossSessions={prevWeeksData.length}
              />

              <SessionsAndHours
                data={createPrevWksChartData(prevWeeksData, today)}
                intervalInTitle="week"
                chartIndex="weekOfDate"
                xAxisLabel="Week of"
              />
            </>
          )}

          {currentTab === "Monthly" && (
            <>
              <Heading
                title="Current month"
                subtitle={currMonthDateRange(today)}
              />

              <TotalMetrics data={calcTotalMetrics(currMonthData)} />

              <Card>
                <Title>Sessions by day</Title>
                <BarChart
                  data={createCurrMChartData(currMonthData, today)}
                  index="date"
                  categories={["Total sessions"]}
                  yAxisWidth={32}
                  colors={["blue"]}
                  allowDecimals={false}
                />
                <Text className="text-center">Day</Text>
              </Card>

              <br />

              <Heading
                title="Previous 6 months"
                subtitle={prevMonthsDateRange(today)}
              />

              <TotalMetrics
                data={{
                  totalSessions: prevMonthsTotalSessions,
                  totalHours: prevMonthsTotalHours,
                  totalPartners: prevMonthsTotalPartners
                }}
              />

              <PieCharts
                data={buildPieData(prevMonthsData)}
                totalSessions={prevMonthsTotalSessions}
                grossSessions={prevMonthsData.length}
              />

              <SessionsAndHours
                data={createPrevMsChartData(prevMonthsData, today)}
                intervalInTitle="month"
                chartIndex="month"
                xAxisLabel="Month"
              />
            </>
          )}

          {currentTab === "Yearly" && (
            <>
              <Heading
                title="Current year"
                subtitle={currYearDateRange(today)}
              />

              <TotalMetrics data={calcTotalMetrics(currYearData)} />

              <Card>
                <Title>Sessions by month</Title>
                <BarChart
                  data={createYTDChartData(currYearData)}
                  index="month"
                  categories={["Total sessions"]}
                  colors={["blue"]}
                  yAxisWidth={32}
                  allowDecimals={false}
                />
                <Text className="text-center">Month</Text>
              </Card>

              <br />

              <Heading
                title="Previous year"
                subtitle={prevYearDateRange(today)}
              />

              <TotalMetrics
                data={{
                  totalSessions: prevYearTotalSessions,
                  totalHours: prevYearTotalHours,
                  totalPartners: prevYearTotalPartners
                }}
              />

              <PieCharts
                data={buildPieData(prevYearData)}
                totalSessions={prevYearTotalSessions}
                grossSessions={prevYearData.length}
              />

              <SessionsAndHours
                data={createPrevYChartData(prevYearData, today)}
                intervalInTitle="month"
                chartIndex="month"
                xAxisLabel="Month"
              />
            </>
          )}

          {currentTab === "Lifetime" && (
            <>
              <Heading title="Lifetime" />

              <TotalMetrics
                data={{
                  totalSessions: lifetimeTotalSessions,
                  totalHours: lifetimeTotalHours,
                  totalPartners: lifetimeTotalPartners
                }}
              />

              <LifetimeMetrics
                data={{
                  sessionsData,
                  lifetimeTotalHours,
                  lifetimeTotalSessions
                }}
              />

              <PieCharts
                data={buildPieData(sessionsData)}
                totalSessions={lifetimeTotalSessions}
                grossSessions={sessionsData.length}
              />

              <Grid numColsSm={1} numColsLg={3} className="gap-3">
                <RecentMilestones
                  sessionsData={sessionsData}
                  lifetimeTotalSessions={lifetimeTotalSessions}
                />
                <RepeatPartners sessionsData={sessionsData} />
              </Grid>
            </>
          )}
        </div>

        <Footer today={today} />
      </>
    );
  }
}
