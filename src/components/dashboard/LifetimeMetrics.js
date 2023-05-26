import React from "react";
import { Card, Metric, Text, Icon, Flex, Grid } from "@tremor/react";
import {
  DesktopComputerIcon,
  LightBulbIcon,
  FireIcon
} from "@heroicons/react/solid";
import PropTypes from "prop-types";

LifetimeMetrics.propTypes = {
  data: PropTypes.shape({
    sessionsData: PropTypes.arrayOf(PropTypes.object).isRequired,
    lifetimeTotalHours: PropTypes.number.isRequired,
    lifetimeTotalSessions: PropTypes.number.isRequired
  })
};

export function LifetimeMetrics({
  data: { sessionsData, lifetimeTotalHours, lifetimeTotalSessions }
}) {
  const firstSession = sessionsData[sessionsData.length - 1]
    ? new Date(sessionsData[sessionsData.length - 1].startTime).toLocaleString(
        "en-US",
        {
          day: "numeric",
          month: "short",
          year: "numeric"
        }
      )
    : "N/A";

  const averageSessionTime = (lifetimeTotalHours * 60) / lifetimeTotalSessions;

  const dailyRecordHours =
    Math.max(
      ...Object.values(
        sessionsData.reduce((acc, curr) => {
          const dateString = curr.startTime.substring(0, 10);

          if (acc[dateString]) {
            acc[dateString] += curr.duration;
          } else {
            acc[dateString] = curr.duration;
          }

          return acc;
        }, {})
      )
    ) / 3600000;

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
