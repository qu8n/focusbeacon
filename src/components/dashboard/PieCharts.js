import React from "react";
import {
  Card,
  Title,
  Text,
  List,
  ListItem,
  DonutChart,
  Legend,
  Grid
} from "@tremor/react";
import PropTypes from "prop-types";

PieCharts.propTypes = {
  data: PropTypes.arrayOf(PropTypes.arrayOf(PropTypes.object)).isRequired,
  totalSessions: PropTypes.number.isRequired,
  grossSessions: PropTypes.number.isRequired
};

export function PieCharts({
  data: [durationData, attendanceData, completionData],
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
          data={durationData}
          category="sessions"
          index="duration"
          colors={["blue", "orange", "yellow"]}
          variant="pie"
        />
        <List>
          {durationData.map((data) => (
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
        <Title>Sessions by attendance</Title>
        <Legend categories={["On time", "Late"]} colors={["blue", "orange"]} />
        <DonutChart
          className="mt-8"
          data={attendanceData}
          category="sessions"
          index="attendance"
          colors={["blue", "orange", "yellow"]}
          variant="pie"
        />
        <List className="mt-5">
          {attendanceData.map((data) => (
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
        <Title>Session completion rate</Title>
        <Legend
          categories={["Complete", "Incomplete"]}
          colors={["blue", "orange"]}
        />
        <DonutChart
          className="mt-8"
          data={completionData}
          category="sessions"
          index="completion"
          colors={["blue", "orange"]}
          variant="pie"
        />
        <List className="mt-5">
          {completionData.map((data) => (
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
