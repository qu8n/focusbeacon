import React from "react";
import { Card, Metric, Text, Icon, Flex, Block, ColGrid } from "@tremor/react";
import {
  ClockIcon,
  VideoCameraIcon,
  UsersIcon,
  FireIcon,
  BellIcon,
  CakeIcon
} from "@heroicons/react/solid";
import PropTypes from "prop-types";

LifetimeMetrics.propTypes = {
  data: PropTypes.array.isRequired
};

export default function LifetimeMetrics({ data }) {
  const [
    totalSessions,
    totalHours,
    totalPartners,
    firstSessionDate,
    maxHoursADay
  ] = data;

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
      metric: Math.round((totalHours * 60) / totalSessions) + " minutes",
      icon: BellIcon
    }
  ];

  const secondGroup = [
    {
      title: "Total unique partners",
      metric: totalPartners.toLocaleString() + " partners",
      icon: UsersIcon
    },
    {
      title: "Most session time in a day",
      metric: Math.round(maxHoursADay).toLocaleString() + " hours",
      icon: FireIcon
    },
    {
      title: "First session date",
      metric: firstSessionDate,
      icon: CakeIcon
    }
  ];

  firstGroup.forEach((item) => {
    item.color = "blue";
  });

  secondGroup.forEach((item) => {
    item.color = "orange";
  });

  return (
    <>
      <Card>
        <ColGrid numColsSm={1} numColsLg={3} gapX="gap-x-10" gapY="gap-y-10">
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
      <Card>
        <ColGrid numColsSm={1} numColsLg={3} gapX="gap-x-10" gapY="gap-y-10">
          {secondGroup.map((item) => (
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
