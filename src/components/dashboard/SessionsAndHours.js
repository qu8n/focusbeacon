/* eslint-disable react/prop-types */
import { BarChart, Card, Title, Text, AreaChart } from "@tremor/react";
import React from "react";
// import PropTypes from "prop-types";

// SessionsAndHours.propTypes = {
//   data: PropTypes.shape({
//     sessions: PropTypes.arrayOf(PropTypes.object).isRequired,
//     hours: PropTypes.arrayOf(PropTypes.object).isRequired
//   }).isRequired,
//   intervalInTitle: PropTypes.string.isRequired,
//   chartIndex: PropTypes.string.isRequired,
//   xAxisLabel: PropTypes.string.isRequired
// };

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
        <AreaChart
          data={hours}
          index={chartIndex}
          categories={["25 minutes", "50 minutes", "75 minutes"]}
          colors={["blue", "orange", "yellow"]}
          yAxisWidth={32}
          stack={true}
          valueFormatter={(value) => Math.round(value * 100) / 100}
          allowDecimals={false}
          showGradient={false}
        />
        <Text className="text-center">{xAxisLabel}</Text>
      </Card>
    </>
  );
}
