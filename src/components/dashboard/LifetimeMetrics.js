import React from "react";
import { Card, Metric, Text, Icon, Flex, Grid } from "@tremor/react";
import {
  DesktopComputerIcon,
  LightBulbIcon,
  FireIcon
} from "@heroicons/react/solid";
import PropTypes from "prop-types";

LifetimeMetrics.propTypes = {
  firstSession: PropTypes.string.isRequired,
  averageSessionTime: PropTypes.number.isRequired,
  dailyRecordHours: PropTypes.number.isRequired
};

export function LifetimeMetrics({
  firstSession,
  averageSessionTime,
  dailyRecordHours
}) {
  const metrics = [
    {
      title: "First session date",
      metric: firstSession,
      icon: LightBulbIcon
    },
    {
      title: "Average session time",
      metric:
        Math.round(averageSessionTime) +
        (Math.round(averageSessionTime) > 1 ? " minutes" : " minute"),
      icon: DesktopComputerIcon
    },
    {
      title: "Daily record",
      metric:
        Math.round(dailyRecordHours) +
        (Math.round(dailyRecordHours) > 1 ? " hours" : " hour"),
      icon: FireIcon
    }
  ];

  return (
    <>
      <Grid numColsSm={1} numColsLg={3} className="gap-3">
        {metrics.map((item) => (
          <Card key={item.title}>
            <Flex justifyContent="start" className="space-x-4">
              <Icon icon={item.icon} variant="light" size="xl" color="orange" />
              <div className="truncate">
                <Text>{item.title}</Text>
                <Metric className="truncate">{item.metric}</Metric>
              </div>
            </Flex>
          </Card>
        ))}
      </Grid>
    </>
  );
}
