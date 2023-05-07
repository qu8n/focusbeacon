/* eslint-disable no-unused-vars */
import React, { useState } from "react";
import { useQuery } from "react-query";
import LoaderSpinner from "./LoaderSpinner";
import processData from "../utils/processData";
import {
  AreaChart,
  BarChart,
  Card,
  ColGrid,
  DonutChart,
  Grid,
  Legend,
  List,
  ListItem,
  Text,
  Title
} from "@tremor/react";
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
import { groupDataByInterval } from "../utils/groupDataByInterval";
import { calcTotalMetrics } from "../utils/calcTotalMetrics";
import { TotalMetrics } from "./dashboard/TotalMetrics";
import { createCurrWkChartData } from "../utils/createCurrWkChartData";
import { currWeekDateRange, prevWeeksDateRange } from "../utils/getDateRanges";
import { createPrevWksChartData } from "../utils/createPrevWksChartData";
import { createPrevWksPieChartsData } from "../utils/createPrevWksPieChartsData";

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
    //   lTWSessionsArr,
    //   lTWHoursArr
    // ] = processData(sessionsData);

    // TODO: use a single today / `new Date()` for all date calculations

    const { currWeekData, prevWeeksData } = groupDataByInterval(sessionsData);

    const {
      totalSessions: currWeekTotalSessions,
      totalHours: currWeekTotalHours,
      totalPartners: currWeekTotalPartners
    } = calcTotalMetrics(currWeekData);
    const {
      totalSessions: prevWeeksTotalSessions,
      totalHours: prevWeeksTotalHours,
      totalPartners: prevWeeksTotalPartners
    } = calcTotalMetrics(prevWeeksData);

    const { sessionsChartData, hoursChartData } =
      createPrevWksChartData(prevWeeksData);

    const { sessionsPieChartData } = createPrevWksPieChartsData(prevWeeksData);

    return (
      <>
        <div className="pb-5 mx-3 mb-10 border-b border-slate-300 sm:mx-20">
          <nav className="space-x-2 sm:space-x-4" aria-label="Tabs">
            {["Weekly", "Monthly", "Lifetime"].map((tab) => (
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
              <div>
                <p className="text-3xl font-semibold text-slate-500">
                  Current week
                </p>
                <p className="text-sm font-normal text-slate-500">
                  {currWeekDateRange()}
                </p>
              </div>
              <TotalMetrics
                totalSessions={currWeekTotalSessions}
                totalHours={currWeekTotalHours}
                totalPartners={currWeekTotalPartners}
              />
              <Card>
                <Title>Total sessions and hours</Title>
                <BarChart
                  data={createCurrWkChartData(currWeekData)}
                  index="weekDay"
                  categories={["Total sessions", "Total hours of sessions"]}
                  colors={["blue", "orange"]}
                  yAxisWidth={32}
                />
                <Text className="text-center">Day of the current week</Text>
              </Card>
              <br />
              <div>
                <p className="text-3xl font-semibold text-slate-500">
                  Previous 4 weeks
                </p>
                <p className="text-sm font-normal text-slate-500">
                  {prevWeeksDateRange()}
                </p>
              </div>
              <TotalMetrics
                totalSessions={prevWeeksTotalSessions}
                totalHours={prevWeeksTotalHours}
                totalPartners={prevWeeksTotalPartners}
              />
              <Card>
                <Title>Total sessions by week</Title>
                <BarChart
                  data={sessionsChartData}
                  index="weekOfDate"
                  categories={["25 minutes", "50 minutes", "75 minutes"]}
                  colors={["blue", "orange", "yellow"]}
                  yAxisWidth={32}
                  stack={true}
                />
                <Text className="text-center">Week of</Text>
              </Card>
              <Card>
                <Title>Total hours of sessions by week</Title>
                <AreaChart
                  data={hoursChartData}
                  index="weekOfDate"
                  categories={["25 minutes", "50 minutes", "75 minutes"]}
                  colors={["blue", "orange", "yellow"]}
                  yAxisWidth={32}
                  stack={true}
                  valueFormatter={(value) => Math.round(value * 100) / 100}
                />
                <Text className="text-center">Week of</Text>
              </Card>
              <Grid numColsSm={1} numColsLg={3} className="gap-2">
                <Card>
                  <Title>Total sessions by duration</Title>
                  <Legend
                    categories={["25 minutes", "50 minutes", "75 minutes"]}
                    colors={["blue", "orange", "yellow"]}
                  />
                  <DonutChart
                    className="mt-5"
                    data={sessionsPieChartData}
                    category="sessions"
                    index="duration"
                    categories={["25 minutes", "50 minutes", "75 minutes"]}
                    colors={["blue", "orange", "yellow"]}
                    variant="pie"
                  />
                  <List marginTop="mt-6">
                    {sessionsPieChartData.map((data) => (
                      <ListItem key={data.duration}>
                        {data.duration}
                        <Text>
                          {data.sessions} sessions (
                          {Math.round(
                            (data.sessions / prevWeeksTotalSessions) * 100
                          )}
                          %)
                        </Text>
                      </ListItem>
                    ))}
                  </List>
                </Card>
              </Grid>
              {/* <Card>
                <Title>Total sessions by week</Title>
                <DonutChart
                  data={sessionsChartData}
                  index="weekOfDate"
                  categories={["25 minutes", "50 minutes", "75 minutes"]}
                  colors={["blue", "orange", "yellow"]}
                  yAxisWidth={32}
                />
                <Text className="text-center">Week of</Text>
              </Card> */}
            </>
            // <div className={cardPadding}>
            //   <TimeSeriesChart
            //     chartType="bar"
            //     title="Sessions by week"
            //     data={lTWSessionsArr}
            //     dataKey="Week of"
            //     categories={["Number of Sessions"]}
            //     tooltip={weeklyChartTooltip}
            //   />
            //   <TimeSeriesChart
            //     chartType="area"
            //     title="Hours of sessions by week"
            //     data={lTWHoursArr}
            //     dataKey="Week of"
            //     categories={["Hours of Sessions"]}
            //     tooltip={weeklyChartTooltip}
            //   />
            // </div>
          )}

          {/* {currentTab === "Monthly" && (
          <div className={cardPadding}>
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
          </div>
        )}

        {currentTab === "Lifetime" && (
          <>
            <div className={cardPadding}>
              <LifetimeMetrics
                data={[
                  totalSessions,
                  totalHours,
                  totalPartners,
                  firstSessionDate,
                  maxHoursADay
                ]}
              />
              <ColGrid numColsLg={3} gapX="gap-x-6" gapY="gap-y-6">
                <SessionsByDuration
                  data={[sessionsByDurationArr, totalSessions]}
                />
                <Milestones data={milestonesArr} />
                <RepeatPartners data={repeatPartnersArr} />
              </ColGrid>
            </div>
          </>
        )} */}
        </div>

        <Footer />
      </>
    );
  }
}
