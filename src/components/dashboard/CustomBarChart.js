import React from "react";
import { Card, BarChart } from "@tremor/react";
import PropTypes from "prop-types";

CustomBarChart.propTypes = {
  data: PropTypes.array.isRequired,
  processData: PropTypes.func.isRequired
};

export function CustomBarChart({ data, processData }) {
  const chartData = processData(data);

  return (
    <Card>
      <BarChart
        data={chartData}
        index="weekDay"
        categories={["Total sessions", "Total hours of sessions"]}
        colors={["blue", "orange"]}
        yAxisWidth={32}
      />
    </Card>
  );
}
