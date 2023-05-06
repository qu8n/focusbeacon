import React from "react";
import { Card, Metric, Text, Icon, Flex, Grid } from "@tremor/react";
import { ClockIcon, VideoCameraIcon, UsersIcon } from "@heroicons/react/solid";
import PropTypes from "prop-types";

TotalMetrics.propTypes = {
  totalSessions: PropTypes.number.isRequired,
  totalHours: PropTypes.number.isRequired,
  totalPartners: PropTypes.number.isRequired
};

export function TotalMetrics({ totalSessions, totalHours, totalPartners }) {
  const metrics = [
    {
      title: "Total sessions",
      metric: totalSessions + " sessions",
      icon: VideoCameraIcon
    },
    {
      title: "Total hours of sessions",
      metric: totalHours.toFixed(1).replace(/\.0$/, "") + " hours", // shows 1 decimal if exists
      icon: ClockIcon
    },
    {
      title: "Total unique partners",
      metric: totalPartners + " partners",
      icon: UsersIcon
    }
  ];

  return (
    <>
      <Grid numColsSm={1} numColsLg={3} className="gap-3">
        {metrics.map((item) => (
          <Card key={item.title}>
            <Flex justifyContent="start" className="space-x-4">
              <Icon
                icon={item.icon}
                variant="light"
                size="xl"
                color={item.color}
              />
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
