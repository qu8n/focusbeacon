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
  Subtitle,
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
import {
  currWeekDateRange,
  prevWeeksDateRange,
  currMonthDateRange,
  prevMonthsDateRange
} from "../utils/getDateRanges";
import { createPrevWksChartData } from "../utils/createPrevWksChartData";
import { createPrevWksPieChartsData } from "../utils/createPrevWksPieChartsData";
import { createPrevMsChartData } from "../utils/createPrevMsChartData";
import { createPrevMsPieChartsData } from "../utils/createPrevMsPieChartsData";

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
    // TODO: use a single today / `new Date()` for all date calculations

    const { currWeekData, prevWeeksData, currMonthData, prevMonthsData } =
      groupDataByInterval(sessionsData);

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

    const {
      totalSessions: currMonthTotalSessions,
      totalHours: currMonthTotalHours,
      totalPartners: currMonthTotalPartners
    } = calcTotalMetrics(currMonthData);

    const {
      totalSessions: prevMonthsTotalSessions,
      totalHours: prevMonthsTotalHours,
      totalPartners: prevMonthsTotalPartners
    } = calcTotalMetrics(prevMonthsData);

    const { weeklySessionsChartData, weeklyHoursChartData } =
      createPrevWksChartData(prevWeeksData);

    const { monthlySessionsChartData, monthlyHoursChartData } =
      createPrevMsChartData(prevMonthsData);

    const {
      weeklyDurationPieData,
      weeklyAttendancePieData,
      weeklyCompletionPieData
    } = createPrevWksPieChartsData(prevWeeksData);

    const {
      monthlyDurationPieData,
      monthlyAttendancePieData,
      monthlyCompletionPieData
    } = createPrevMsPieChartsData(prevMonthsData);

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
              <div className="text-slate-500">
                <p className="text-3xl font-semibold">Current week</p>
                <p className="text-sm font-normal">{currWeekDateRange()}</p>
              </div>

              <TotalMetrics
                totalSessions={currWeekTotalSessions}
                totalHours={currWeekTotalHours}
                totalPartners={currWeekTotalPartners}
              />

              <Card>
                <Title>Sessions by day</Title>
                <BarChart
                  data={createCurrWkChartData(currWeekData)}
                  index="weekDay"
                  categories={["Total sessions"]}
                  colors={["blue", "orange"]}
                  yAxisWidth={32}
                />
                <Text className="text-center">Day of the current week</Text>
              </Card>
              <br />
              <div className="text-slate-500">
                <p className="text-3xl font-semibold">Previous 4 weeks</p>
                <p className="text-sm font-normal">{prevWeeksDateRange()}</p>
              </div>

              <TotalMetrics
                totalSessions={prevWeeksTotalSessions}
                totalHours={prevWeeksTotalHours}
                totalPartners={prevWeeksTotalPartners}
              />

              <Grid numColsSm={1} numColsLg={3} className="gap-3">
                <Card>
                  <Title>Sessions by duration</Title>
                  <Legend
                    categories={["25 minutes", "50 minutes", "75 minutes"]}
                    colors={["blue", "orange", "yellow"]}
                  />
                  <DonutChart
                    className="mt-3"
                    data={weeklyDurationPieData}
                    category="sessions"
                    index="duration"
                    colors={["blue", "orange", "yellow"]}
                    variant="pie"
                  />
                  <List>
                    {weeklyDurationPieData.map((data) => (
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

                <Card>
                  <Title>Sessions by attendance</Title>
                  <Legend
                    categories={["On time", "Late"]}
                    colors={["blue", "orange"]}
                  />
                  <DonutChart
                    className="mt-8"
                    data={weeklyAttendancePieData}
                    category="sessions"
                    index="attendance"
                    colors={["blue", "orange", "yellow"]}
                    variant="pie"
                  />
                  <List className="mt-5">
                    {weeklyAttendancePieData.map((data) => (
                      <ListItem key={data.attendance}>
                        {data.attendance}
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

                <Card>
                  <Title>Session completion rate</Title>
                  <Legend
                    categories={["Complete", "Incomplete"]}
                    colors={["blue", "orange"]}
                  />
                  <DonutChart
                    className="mt-8"
                    data={weeklyCompletionPieData}
                    category="sessions"
                    index="completion"
                    colors={["blue", "orange"]}
                    variant="pie"
                  />
                  <List className="mt-5">
                    {weeklyCompletionPieData.map((data) => (
                      <ListItem key={data.completion}>
                        {data.completion}
                        <Text>
                          {data.sessions} sessions (
                          {Math.round(
                            (data.sessions / prevWeeksData.length) * 100
                          )}
                          %)
                        </Text>
                      </ListItem>
                    ))}
                  </List>
                </Card>
              </Grid>

              <Card>
                <Title>Sessions by week</Title>
                <BarChart
                  data={weeklySessionsChartData}
                  index="weekOfDate"
                  categories={["25 minutes", "50 minutes", "75 minutes"]}
                  colors={["blue", "orange", "yellow"]}
                  yAxisWidth={32}
                  stack={true}
                />
                <Text className="text-center">Week of</Text>
              </Card>
              <Card>
                <Title>Hours of sessions by week</Title>
                <AreaChart
                  data={weeklyHoursChartData}
                  index="weekOfDate"
                  categories={["25 minutes", "50 minutes", "75 minutes"]}
                  colors={["blue", "orange", "yellow"]}
                  yAxisWidth={32}
                  stack={true}
                  valueFormatter={(value) => Math.round(value * 100) / 100}
                />
                <Text className="text-center">Week of</Text>
              </Card>
            </>
          )}

          {currentTab === "Monthly" && (
            <>
              <div className="text-slate-500">
                <p className="text-3xl font-semibold">Current month</p>
                <p className="text-sm font-normal">{currMonthDateRange()}</p>
              </div>

              <TotalMetrics
                totalSessions={currMonthTotalSessions}
                totalHours={currMonthTotalHours}
                totalPartners={currMonthTotalPartners}
              />

              <br />

              <div className="text-slate-500">
                <p className="text-3xl font-semibold">Previous 6 months</p>
                <p className="text-sm font-normal">{prevMonthsDateRange()}</p>
              </div>

              <TotalMetrics
                totalSessions={prevMonthsTotalSessions}
                totalHours={prevMonthsTotalHours}
                totalPartners={prevMonthsTotalPartners}
              />

              <Grid numColsSm={1} numColsLg={3} className="gap-3">
                <Card>
                  <Title>Sessions by duration</Title>
                  <Legend
                    categories={["25 minutes", "50 minutes", "75 minutes"]}
                    colors={["blue", "orange", "yellow"]}
                  />
                  <DonutChart
                    className="mt-3"
                    data={monthlyDurationPieData}
                    category="sessions"
                    index="duration"
                    colors={["blue", "orange", "yellow"]}
                    variant="pie"
                  />
                  <List>
                    {monthlyDurationPieData.map((data) => (
                      <ListItem key={data.duration}>
                        {data.duration}
                        <Text>
                          {data.sessions} sessions (
                          {Math.round(
                            (data.sessions / prevMonthsTotalSessions) * 100
                          )}
                          %)
                        </Text>
                      </ListItem>
                    ))}
                  </List>
                </Card>

                <Card>
                  <Title>Sessions by attendance</Title>
                  <Legend
                    categories={["On time", "Late"]}
                    colors={["blue", "orange"]}
                  />
                  <DonutChart
                    className="mt-8"
                    data={monthlyAttendancePieData}
                    category="sessions"
                    index="attendance"
                    colors={["blue", "orange", "yellow"]}
                    variant="pie"
                  />
                  <List className="mt-5">
                    {monthlyAttendancePieData.map((data) => (
                      <ListItem key={data.attendance}>
                        {data.attendance}
                        <Text>
                          {data.sessions} sessions (
                          {Math.round(
                            (data.sessions / prevMonthsTotalSessions) * 100
                          )}
                          %)
                        </Text>
                      </ListItem>
                    ))}
                  </List>
                </Card>

                <Card>
                  <Title>Session completion rate</Title>
                  <Legend
                    categories={["Complete", "Incomplete"]}
                    colors={["blue", "orange"]}
                  />
                  <DonutChart
                    className="mt-8"
                    data={monthlyCompletionPieData}
                    category="sessions"
                    index="completion"
                    colors={["blue", "orange"]}
                    variant="pie"
                  />
                  <List className="mt-5">
                    {monthlyCompletionPieData.map((data) => (
                      <ListItem key={data.completion}>
                        {data.completion}
                        <Text>
                          {data.sessions} sessions (
                          {Math.round(
                            (data.sessions / prevMonthsData.length) * 100
                          )}
                          %)
                        </Text>
                      </ListItem>
                    ))}
                  </List>
                </Card>
              </Grid>

              <Card>
                <Title>Sessions by month</Title>
                <BarChart
                  data={monthlySessionsChartData}
                  index="month"
                  categories={["25 minutes", "50 minutes", "75 minutes"]}
                  colors={["blue", "orange", "yellow"]}
                  yAxisWidth={32}
                  stack={true}
                />
                <Text className="text-center">Month</Text>
              </Card>
              <Card>
                <Title>Hours of sessions by month</Title>
                <AreaChart
                  data={monthlyHoursChartData}
                  index="month"
                  categories={["25 minutes", "50 minutes", "75 minutes"]}
                  colors={["blue", "orange", "yellow"]}
                  yAxisWidth={32}
                  stack={true}
                  valueFormatter={(value) => Math.round(value * 100) / 100}
                />
                <Text className="text-center">Month</Text>
              </Card>
            </>
          )}
        </div>

        <Footer />
      </>
    );
  }
}
