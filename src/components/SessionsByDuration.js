import {
  Card,
  Flex,
  List,
  ListItem,
  Title,
  Text,
  DonutChart,
  Legend,
} from "@tremor/react";
import React from "react";
import PropTypes from "prop-types";

SessionsByDuration.propTypes = {
  data: PropTypes.arrayOf(PropTypes.object).isRequired,
};

export default function SessionsByDuration({ data }) {
  const [sessionsByDurationArr, totalSessions] = data;

  const valueFormatter = (number) =>
    `${Intl.NumberFormat("us").format(number).toString()}`;

  return (
    <Card>
      <Flex
        spaceX="space-x-8"
        justifyContent="justify-start"
        alignItems="items-center"
      >
        <Title>Sessions by Duration</Title>
      </Flex>

      <Legend
        categories={sessionsByDurationArr.map((data) => data.duration)}
        colors={["blue", "orange", "yellow"]}
      />

      <DonutChart
        data={sessionsByDurationArr}
        dataKey="duration"
        category="sessions"
        variant="pie"
        colors={["blue", "orange", "yellow"]}
        valueFormatter={valueFormatter}
        marginTop="mt-6"
        height="h-44"
      />

      <List marginTop="mt-6">
        {sessionsByDurationArr.map((data) => (
          <ListItem key={data.duration}>
            {data.duration}
            <Text>
              {Intl.NumberFormat("us").format(data.sessions).toString()}{" "}
              sessions ({Math.round((data.sessions / totalSessions) * 100)}%)
            </Text>
          </ListItem>
        ))}
      </List>
    </Card>
  );
}
