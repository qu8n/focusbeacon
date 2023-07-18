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
import { getCompletedSessions } from '../utils/getCompletedSessions';

// Rest of Code
