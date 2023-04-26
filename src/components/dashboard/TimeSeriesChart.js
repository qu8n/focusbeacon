import { InformationCircleIcon } from "@heroicons/react/outline";
import {
  BarChart,
  AreaChart,
  Card,
  Flex,
  Icon,
  Text,
  Title,
} from "@tremor/react";
import React from "react";
import PropTypes from "prop-types";

TimeSeriesChart.propTypes = {
  chartType: PropTypes.string.isRequired,
  title: PropTypes.string.isRequired,
  data: PropTypes.arrayOf(PropTypes.object).isRequired,
  dataKey: PropTypes.string.isRequired,
  categories: PropTypes.arrayOf(PropTypes.string).isRequired,
  tooltip: PropTypes.string.isRequired,
};

export default function TimeSeriesChart({
  chartType,
  title,
  data,
  dataKey,
  categories,
  tooltip,
}) {
  const dataFormatter = (number) => {
    return Intl.NumberFormat("us").format(number).toString();
  };

  return (
    <Card>
      <Flex alignItems="align-top">
        <Title>{title}</Title>
        <Icon
          icon={InformationCircleIcon}
          variant="simple"
          tooltip={tooltip}
          color="slate"
        />
      </Flex>
      {chartType === "bar" && (
        <BarChart
          data={data}
          dataKey={dataKey}
          categories={categories}
          colors={["blue"]}
          valueFormatter={dataFormatter}
          marginTop="mt-6"
          yAxisWidth="w-8"
          showLegend={false}
        />
      )}
      {chartType === "area" && (
        <AreaChart
          data={data}
          dataKey={dataKey}
          categories={categories}
          colors={["blue"]}
          valueFormatter={dataFormatter}
          marginTop="mt-6"
          yAxisWidth="w-8"
          showLegend={false}
        />
      )}
      <Text textAlignment="text-center">{dataKey}</Text>
    </Card>
  );
}
