import React, { useState, useEffect } from "react";
import { useQuery } from "react-query";
import {
  AreaChart,
  BarChart,
  Card,
  DonutChart,
  Grid,
  Legend,
  List,
  ListItem,
  Table,
  TableBody,
  TableCell,
  TableHead,
  TableHeaderCell,
  TableRow,
  Text,
  Title
} from "@tremor/react";
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
  prevMonthsDateRange,
  currYearDateRange,
  prevYearDateRange
} from "../utils/getDateRanges";
// refactor these utils to a generic createChartData function?
import { createPrevWksChartData } from "../utils/createPrevWksChartData";
import { createPrevWksPieChartsData } from "../utils/createPrevWksPieChartsData";
import { createPrevMsChartData } from "../utils/createPrevMsChartData";
import { createPrevMsPieChartsData } from "../utils/createPrevMsPieChartsData";
import { createCurrMChartData } from "../utils/createCurrMChartData";
import { createYTDChartData } from "../utils/createYTDChartData";
import { createPrevYPieChartsData } from "../utils/createPrevYPieChartsData";
import { createPrevYChartData } from "../utils/createPrevYChartData";
import { createLifetimePieChartsData } from "../utils/createLifetimePieChartsData";
import { TotalLifetimeMetrics } from "./dashboard/TotalLifetimeMetrics";
import { RepeatPartners } from "./dashboard/RepeatPartners";
import LoaderSpinner from "./LoaderSpinner";

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

  if (isLoading) {
    return <LoaderSpinner />;
  }

  if (isError) {
    return <p>Error: {error.message}</p>;
  }

  // eslint-disable-next-line no-unused-vars
  const { profileData, sessionsData } = data;

  if (!sessionsData) {
    return <LoaderSpinner />;
  }

  // TODO: use a single today / `new Date()` for all date calculations that use today/new Date()
  const today = new Date();

  const {
    currWeekData,
    prevWeeksData,
    currMonthData,
    prevMonthsData,
    currYearData,
    prevYearData
  } = groupDataByInterval(sessionsData, today);

  // TODO pass these calcTotalMetrics directly into the component
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

  const {
    totalSessions: yearToDateTotalSessions,
    totalHours: yearToDateTotalHours,
    totalPartners: yearToDateTotalPartners
  } = calcTotalMetrics(currYearData);

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

  const { weeklySessionsChartData, weeklyHoursChartData } =
    createPrevWksChartData(prevWeeksData);

  const {
    weeklyDurationPieData,
    weeklyAttendancePieData,
    weeklyCompletionPieData
  } = createPrevWksPieChartsData(prevWeeksData);

  const { monthlySessionsChartData, monthlyHoursChartData } =
    createPrevMsChartData(prevMonthsData);

  const {
    monthlyDurationPieData,
    monthlyAttendancePieData,
    monthlyCompletionPieData
  } = createPrevMsPieChartsData(prevMonthsData);

  const {
    yearlyDurationPieData,
    yearlyAttendancePieData,
    yearlyCompletionPieData
  } = createPrevYPieChartsData(prevYearData);

  const { yearlySessionsChartData, yearlyHoursChartData } =
    createPrevYChartData(prevYearData);

  const {
    lifetimeDurationPieData,
    lifetimeAttendancePieData,
    lifetimeCompletionPieData
  } = createLifetimePieChartsData(sessionsData);

  const milestoneSessions = [];
  let currentMilestone = 0;
  const milestoneLevelsAndUnits = {
    25: 1,
    50: 5,
    125: 10,
    250: 25,
    500: 50,
    1250: 100,
    2500: 250,
    100000: 500
  };
  const milestoneUpperLevel = Object.keys(milestoneLevelsAndUnits).find(
    (key) => key > lifetimeTotalSessions
  );
  const unit = milestoneLevelsAndUnits[milestoneUpperLevel];
  currentMilestone = Math.floor(lifetimeTotalSessions / unit) * unit;
  for (
    let i = 0;
    i < Math.min(Math.floor(lifetimeTotalSessions / unit), 5);
    i++
  ) {
    milestoneSessions.push(currentMilestone);
    currentMilestone -= unit;
  }
  const milestonesArr = sessionsData
    .filter((session) => session.users[0].completed === true)
    .toReversed()
    .reduce((acc, session, sessionsCounter) => {
      if (milestoneSessions.includes(sessionsCounter + 1)) {
        acc.push({ milestone: sessionsCounter + 1, date: session.startTime });
      }
      return acc;
    }, [])
    .toReversed();

  const partnerIdsArr = Object.values(
    sessionsData.reduce((acc, session) => {
      if (session.users[1]?.userId && session.users[0].completed === true) {
        if (acc[session.users[1]?.userId]) {
          acc[session.users[1]?.userId] += 1;
        } else {
          acc[session.users[1]?.userId] = 1;
        }
      }
      return acc;
    }, {})
  );
  const repeatPartnersObj = {};
  for (let i = 0; i < partnerIdsArr.length; i++) {
    repeatPartnersObj[partnerIdsArr[i]] =
      (repeatPartnersObj[partnerIdsArr[i]] || 0) + 1;
  }
  const repeatPartnersArr = [];
  for (let i in repeatPartnersObj) {
    repeatPartnersArr.push({
      sharedSessions: parseInt(i),
      partners: repeatPartnersObj[i]
    });
  }

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
            <div className="text-slate-500">
              <p className="text-3xl font-semibold">Current week</p>
              <p className="font-normal text-md">{currWeekDateRange()}</p>
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
                colors={["blue"]}
                yAxisWidth={32}
                allowDecimals={false}
              />
              <Text className="text-center">Day of the current week</Text>
            </Card>

            <br />

            <div className="text-slate-500">
              <p className="text-3xl font-semibold">Previous 4 weeks</p>
              <p className="font-normal text-md">{prevWeeksDateRange()}</p>
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
                allowDecimals={false}
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
                allowDecimals={false}
              />
              <Text className="text-center">Week of</Text>
            </Card>
          </>
        )}

        {currentTab === "Monthly" && (
          <>
            <div className="text-slate-500">
              <p className="text-3xl font-semibold">Current month</p>
              <p className="font-normal text-md">{currMonthDateRange()}</p>
            </div>

            <TotalMetrics
              totalSessions={currMonthTotalSessions}
              totalHours={currMonthTotalHours}
              totalPartners={currMonthTotalPartners}
            />

            <Card>
              <Title>Sessions by day</Title>
              <BarChart
                data={createCurrMChartData(currMonthData)}
                index="date"
                categories={["Total sessions"]}
                yAxisWidth={32}
                colors={["blue"]}
                allowDecimals={false}
              />
              <Text className="text-center">Day</Text>
            </Card>

            <br />

            <div className="text-slate-500">
              <p className="text-3xl font-semibold">Previous 6 months</p>
              <p className="font-normal text-md">{prevMonthsDateRange()}</p>
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
                allowDecimals={false}
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
                allowDecimals={false}
              />
              <Text className="text-center">Month</Text>
            </Card>
          </>
        )}

        {currentTab === "Yearly" && (
          <>
            <div className="text-slate-500">
              <p className="text-3xl font-semibold">Current year</p>
              <p className="font-normal text-md">{currYearDateRange()}</p>
            </div>

            <TotalMetrics
              totalSessions={yearToDateTotalSessions}
              totalHours={yearToDateTotalHours}
              totalPartners={yearToDateTotalPartners}
            />

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

            <div className="text-slate-500">
              <p className="text-3xl font-semibold">Previous year</p>
              <p className="font-normal text-md">{prevYearDateRange()}</p>
            </div>

            <TotalMetrics
              totalSessions={prevYearTotalSessions}
              totalHours={prevYearTotalHours}
              totalPartners={prevYearTotalPartners}
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
                  data={yearlyDurationPieData}
                  category="sessions"
                  index="duration"
                  colors={["blue", "orange", "yellow"]}
                  variant="pie"
                />
                <List>
                  {yearlyDurationPieData.map((data) => (
                    <ListItem key={data.duration}>
                      {data.duration}
                      <Text>
                        {data.sessions} sessions (
                        {Math.round(
                          (data.sessions / prevYearTotalSessions) * 100
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
                  data={yearlyAttendancePieData}
                  category="sessions"
                  index="attendance"
                  colors={["blue", "orange", "yellow"]}
                  variant="pie"
                />
                <List className="mt-5">
                  {yearlyAttendancePieData.map((data) => (
                    <ListItem key={data.attendance}>
                      {data.attendance}
                      <Text>
                        {data.sessions} sessions (
                        {Math.round(
                          (data.sessions / prevYearTotalSessions) * 100
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
                  data={yearlyCompletionPieData}
                  category="sessions"
                  index="completion"
                  colors={["blue", "orange"]}
                  variant="pie"
                />
                <List className="mt-5">
                  {yearlyCompletionPieData.map((data) => (
                    <ListItem key={data.completion}>
                      {data.completion}
                      <Text>
                        {data.sessions} sessions (
                        {Math.round(
                          (data.sessions / prevYearData.length) * 100
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
                data={yearlySessionsChartData}
                index="month"
                categories={["25 minutes", "50 minutes", "75 minutes"]}
                colors={["blue", "orange", "yellow"]}
                yAxisWidth={32}
                stack={true}
                allowDecimals={false}
              />
              <Text className="text-center">Month</Text>
            </Card>

            <Card>
              <Title>Hours of sessions by month</Title>
              <AreaChart
                data={yearlyHoursChartData}
                index="month"
                categories={["25 minutes", "50 minutes", "75 minutes"]}
                colors={["blue", "orange", "yellow"]}
                yAxisWidth={32}
                stack={true}
                valueFormatter={(value) => Math.round(value * 100) / 100}
                allowDecimals={false}
              />
              <Text className="text-center">Month</Text>
            </Card>
          </>
        )}

        {currentTab === "Lifetime" && (
          <>
            <div className="text-slate-500">
              <p className="text-3xl font-semibold">Lifetime</p>
            </div>

            <TotalMetrics
              totalSessions={lifetimeTotalSessions}
              totalHours={lifetimeTotalHours}
              totalPartners={lifetimeTotalPartners}
            />

            <TotalLifetimeMetrics
              firstSession={
                sessionsData[sessionsData.length - 1]
                  ? new Date(
                      sessionsData[sessionsData.length - 1].startTime
                    ).toLocaleString("en-US", {
                      day: "numeric",
                      month: "short",
                      year: "numeric"
                    })
                  : "N/A"
              }
              averageSessionTime={
                (lifetimeTotalHours * 60) / lifetimeTotalSessions
              }
              dailyRecordHours={
                Math.max(
                  ...Object.values(
                    sessionsData.reduce((acc, curr) => {
                      const dateString = curr.startTime.substring(0, 10);

                      if (acc[dateString]) {
                        acc[dateString] += curr.duration;
                      } else {
                        acc[dateString] = curr.duration;
                      }

                      return acc;
                    }, {})
                  )
                ) / 3600000
              }
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
                  data={lifetimeDurationPieData}
                  category="sessions"
                  index="duration"
                  colors={["blue", "orange", "yellow"]}
                  variant="pie"
                />
                <List>
                  {lifetimeDurationPieData.map((data) => (
                    <ListItem key={data.duration}>
                      {data.duration}
                      <Text>
                        {data.sessions} sessions (
                        {Math.round(
                          (data.sessions / lifetimeTotalSessions) * 100
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
                  data={lifetimeAttendancePieData}
                  category="sessions"
                  index="attendance"
                  colors={["blue", "orange", "yellow"]}
                  variant="pie"
                />
                <List className="mt-5">
                  {lifetimeAttendancePieData.map((data) => (
                    <ListItem key={data.attendance}>
                      {data.attendance}
                      <Text>
                        {data.sessions} sessions (
                        {Math.round(
                          (data.sessions / lifetimeTotalSessions) * 100
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
                  data={lifetimeCompletionPieData}
                  category="sessions"
                  index="completion"
                  colors={["blue", "orange"]}
                  variant="pie"
                />
                <List className="mt-5">
                  {lifetimeCompletionPieData.map((data) => (
                    <ListItem key={data.completion}>
                      {data.completion}
                      <Text>
                        {data.sessions} sessions (
                        {Math.round(
                          (data.sessions / sessionsData.length) * 100
                        )}
                        %)
                      </Text>
                    </ListItem>
                  ))}
                </List>
              </Card>
            </Grid>

            <Grid numColsSm={1} numColsLg={3} className="gap-3">
              <Card>
                <Title>Recent milestones</Title>
                <Table className="mt-5">
                  <TableHead>
                    <TableRow>
                      <TableHeaderCell>Milestone</TableHeaderCell>
                      <TableHeaderCell className="text-right">
                        Date
                      </TableHeaderCell>
                    </TableRow>
                  </TableHead>

                  <TableBody>
                    {milestonesArr.map((milestone) => (
                      <TableRow key={milestone.milestone}>
                        <TableCell>
                          {milestone.milestone.toLocaleString()}{" "}
                          {milestone.milestone > 1 ? "sessions" : "session"}
                        </TableCell>
                        <TableCell className="text-right">
                          {new Date(milestone.date).toLocaleDateString(
                            "en-US",
                            {
                              month: "long",
                              day: "numeric",
                              year: "numeric"
                            }
                          )}
                        </TableCell>
                      </TableRow>
                    ))}
                  </TableBody>
                </Table>
              </Card>

              <RepeatPartners data={repeatPartnersArr.reverse()} />
            </Grid>
          </>
        )}
      </div>

      <Footer />
    </>
  );
}
