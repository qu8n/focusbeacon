import React from "react";
import {
  Card,
  Title,
  Text,
  List,
  ListItem,
  DonutChart,
  Legend,
  Grid,
  Flex,
  Icon
} from "@tremor/react";
import { InformationCircleIcon } from "@heroicons/react/outline";
import PropTypes from "prop-types";

PieCharts.propTypes = {
  data: PropTypes.arrayOf(PropTypes.arrayOf(PropTypes.object)).isRequired,
  totalSessions: PropTypes.number.isRequired,
  grossSessions: PropTypes.number.isRequired
};

export function PieCharts({
  data: [durationChartData, attendanceChartData, completionChartData],
  totalSessions,
  grossSessions
}) {
  return (
    <Grid numColsSm={1} numColsLg={3} className="gap-3">
      <Card>
        <Title>Sessions by duration</Title>
        <Legend
          categories={["25 minutes", "50 minutes", "75 minutes"]}
          colors={["blue", "orange", "yellow"]}
        />
        <DonutChart
          className="mt-3"
          data={durationChartData}
          category="sessions"
          index="duration"
          colors={["blue", "orange", "yellow"]}
          variant="pie"
        />
        <List>
          {durationChartData.map((data) => (
            <ListItem key={data.duration}>
              {data.duration}
              <Text>
                {data.sessions} sessions (
                {Math.round((data.sessions / totalSessions) * 100)}
                %)
              </Text>
            </ListItem>
          ))}
        </List>
      </Card>

      <Card>
        <Flex className="align-top">
          <Title>Sessions timeliness</Title>
          <Icon
            icon={InformationCircleIcon}
            variant="simple"
            tooltip="'On time' sessions are those where you joined less than 2 minutes late"
            color="slate"
          />
        </Flex>
        <Legend categories={["On time", "Late"]} colors={["blue", "orange"]} />
        <DonutChart
          className="mt-8"
          data={attendanceChartData}
          category="sessions"
          index="attendance"
          colors={["blue", "orange", "yellow"]}
          variant="pie"
        />
        <List className="mt-5">
          {attendanceChartData.map((data) => (
            <ListItem key={data.attendance}>
              {data.attendance}
              <Text>
                {data.sessions} sessions (
                {Math.round((data.sessions / totalSessions) * 100)}
                %)
              </Text>
            </ListItem>
          ))}
        </List>
      </Card>

      <Card>
        <Flex className="align-top">
          <Title>Session completion rate</Title>
          <Icon
            icon={InformationCircleIcon}
            variant="simple"
            tooltip="'Completed' sessions are sessions that were booked and reached the end without cancelling or leaving early. Note that all metrics, except for this card, exclude incomplete sessions"
            color="slate"
          />
        </Flex>
        <Legend
          categories={["Complete", "Incomplete"]}
          colors={["blue", "orange"]}
        />
        <DonutChart
          className="mt-8"
          data={completionChartData}
          category="sessions"
          index="completion"
          colors={["blue", "orange"]}
          variant="pie"
        />
        <List className="mt-5">
          {completionChartData.map((data) => (
            <ListItem key={data.completion}>
              {data.completion}
              <Text>
                {data.sessions} sessions (
                {Math.round((data.sessions / grossSessions) * 100)}
                %)
              </Text>
            </ListItem>
          ))}
        </List>
      </Card>
    </Grid>
  );
}
