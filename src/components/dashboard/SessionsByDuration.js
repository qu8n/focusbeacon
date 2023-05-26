import React from "react";
import {
  Card,
  Title,
  Text,
  List,
  ListItem,
  DonutChart,
  Legend
} from "@tremor/react";
import PropTypes from "prop-types";

SessionsByDuration.propTypes = {
  data: PropTypes.arrayOf(PropTypes.object).isRequired,
  totalSessions: PropTypes.number.isRequired
};

export function SessionsByDuration({ data, totalSessions }) {
  return (
    <Card>
      <Title>Sessions by duration</Title>
      <Legend
        categories={["25 minutes", "50 minutes", "75 minutes"]}
        colors={["blue", "orange", "yellow"]}
      />
      <DonutChart
        className="mt-3"
        data={data}
        category="sessions"
        index="duration"
        colors={["blue", "orange", "yellow"]}
        variant="pie"
      />
      <List>
        {data.map((data) => (
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
  );
}
