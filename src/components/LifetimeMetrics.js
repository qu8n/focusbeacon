import React from 'react';
import { Card, Metric, Text, Icon, Flex, Block, ColGrid } from '@tremor/react';
import { ClockIcon, VideoCameraIcon, UsersIcon, FireIcon, BellIcon, CakeIcon } from '@heroicons/react/solid';

export default function LifetimeMetrics({data}) {
    const [
        totalSessions, 
        totalHours, 
        totalPartners,
        firstSessionDate,
        maxHoursADay,
    ] = data;

    const firstGroup = [
        {
            title: 'Total Sessions',
            metric: totalSessions.toLocaleString() + ' sessions',
            icon: VideoCameraIcon
        },
        {
            title: 'Total Hours of Sessions',
            metric: Math.round(totalHours).toLocaleString() + ' hours',
            icon: ClockIcon
        },
        {
            title: 'Average Time per Session',
            metric: Math.round(totalHours * 60 / totalSessions) + ' minutes',
            icon: BellIcon,
        },
    ];

    const secondGroup = [
        {
            title: 'Total Unique Partners',
            metric: totalPartners.toLocaleString() + ' partners',
            icon: UsersIcon,
        },
        {
            title: 'Most Session Time in a Day',
            metric: Math.round(maxHoursADay).toLocaleString() + ' hours',
            icon: FireIcon,
        },
        {
            title: 'First Session Date',
            metric: firstSessionDate,
            icon: CakeIcon,
        },
    ];

    firstGroup.forEach((item) => {
        item.color = 'indigo';
    });

    secondGroup.forEach((item) => {
        item.color = 'yellow';
    });


    return (
        <>
        <Card>
            <ColGrid numColsSm={ 1 } numColsLg={ 3 } gapX="gap-x-10" gapY="gap-y-10">
                { firstGroup.map((item) => (
                    <Flex key={ item.title } justifyContent="justify-start" spaceX="space-x-4">
                        <Icon
                            icon={ item.icon }
                            variant="light"
                            size="xl"
                            color={ item.color }
                        />
                        <Block truncate={ true }>
                            <Text>{ item.title }</Text>
                            <Metric truncate={ true }>{ item.metric }</Metric>
                        </Block>
                    </Flex>
                )) }
            </ColGrid>
        </Card>
        <br />
        <Card>
        <ColGrid numColsSm={ 1 } numColsLg={ 3 } gapX="gap-x-10" gapY="gap-y-10">
            { secondGroup.map((item) => (
                <Flex key={ item.title } justifyContent="justify-start" spaceX="space-x-4">
                    <Icon
                        icon={ item.icon }
                        variant="light"
                        size="xl"
                        color={ item.color }
                    />
                    <Block truncate={ true }>
                        <Text>{ item.title }</Text>
                        <Metric truncate={ true }>{ item.metric }</Metric>
                    </Block>
                </Flex>
            )) }
        </ColGrid>
    </Card>
    </>
    );
};
