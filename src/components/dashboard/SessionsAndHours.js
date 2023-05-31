import { BarChart, Card, Title, Text } from "@tremor/react";
import React from "react";
import PropTypes from "prop-types";

SessionsAndHours.propTypes = {
  data: PropTypes.arrayOf(PropTypes.arrayOf(PropTypes.object)).isRequired,
  intervalInTitle: PropTypes.string.isRequired,
  chartIndex: PropTypes.string.isRequired,
  xAxisLabel: PropTypes.string.isRequired
};

export function SessionsAndHours({
  data: [sessions, hours],
  intervalInTitle,
  chartIndex,
  xAxisLabel
}) {
  return (
    <>
      <Card>
        <Title>Sessions by {intervalInTitle}</Title>
        <BarChart
          data={sessions}
          index={chartIndex}
          categories={["25 minutes", "50 minutes", "75 minutes"]}
          colors={["blue", "orange", "yellow"]}
          yAxisWidth={32}
          stack={true}
          allowDecimals={false}
        />
        <Text className="text-center">{xAxisLabel}</Text>
      </Card>

      <Card>
        <Title>Hours of sessions by {intervalInTitle}</Title>
        <BarChart
          data={hours}
          index={chartIndex}
          categories={["25 minutes", "50 minutes", "75 minutes"]}
          colors={["blue", "orange", "yellow"]}
          yAxisWidth={32}
          stack={true}
          valueFormatter={(number) => {
            const hours = Math.floor(number);
            const minutes = Math.round((number - hours) * 60);
            return `${hours}h${minutes > 0 ? ` ${minutes}m` : ""}`;
          }}
          allowDecimals={false}
        />
        <Text className="text-center">{xAxisLabel}</Text>
      </Card>
    </>
  );
}
