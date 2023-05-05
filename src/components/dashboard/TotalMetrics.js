import React from "react";
import { Card, Metric, Text, Icon, Flex, Block, ColGrid } from "@tremor/react";
import {
  ClockIcon,
  VideoCameraIcon,
  UsersIcon,
  BellIcon
} from "@heroicons/react/solid";
import PropTypes from "prop-types";

TotalMetrics.propTypes = {
  data: PropTypes.object.isRequired
};

export function TotalMetrics({ data }) {
  const { totalSessions, totalHours, avgSessionMinutes, totalPartners } = data;

  const firstGroup = [
    {
      title: "Total sessions",
      metric: totalSessions.toLocaleString() + " sessions",
      icon: VideoCameraIcon
    },
    {
      title: "Total hours of sessions",
      metric: Math.round(totalHours).toLocaleString() + " hours",
      icon: ClockIcon
    },
    {
      title: "Average time per session",
      metric: Math.round(avgSessionMinutes) + " minutes",
      icon: BellIcon
    },
    {
      title: "Total unique partners",
      metric: totalPartners.toLocaleString() + " partners",
      icon: UsersIcon
    }
  ];

  firstGroup.forEach((item) => {
    item.color = "blue";
  });

  return (
    <>
      <Card>
        <ColGrid numColsSm={1} numColsLg={4} gapX="gap-x-10" gapY="gap-y-10">
          {firstGroup.map((item) => (
            <Flex
              key={item.title}
              justifyContent="justify-start"
              spaceX="space-x-4"
            >
              <Icon
                icon={item.icon}
                variant="light"
                size="xl"
                color={item.color}
              />
              <Block truncate={true}>
                <Text>{item.title}</Text>
                <Metric truncate={true}>{item.metric}</Metric>
              </Block>
            </Flex>
          ))}
        </ColGrid>
      </Card>
    </>
  );
}
