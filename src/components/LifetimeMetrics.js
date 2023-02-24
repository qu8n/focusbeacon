import React from 'react';
import { Card, Metric, Text, Icon, Flex, Block, ColGrid } from '@tremor/react';
import { ClockIcon, VideoCameraIcon, UsersIcon, FireIcon, BellIcon, CakeIcon } from '@heroicons/react/solid';

export default function LifetimeMetrics(props) {
    const [loading, data] = props.data;

    const [
        totalSessions, 
        totalHours, 
        totalPartners,
        firstSessionDate,
        maxHoursADay,
    ] = process(data);

    const firstGroup = [
        {
            title: 'Total Sessions',
            metric: totalSessions + ' sessions',
            icon: VideoCameraIcon
        },
        {
            title: 'Total Hours of Sessions',
            metric: totalHours + ' hours',
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
            metric: totalPartners + ' partners',
            icon: UsersIcon,
        },
        {
            title: 'Most Session Time in a Day',
            metric: maxHoursADay + ' hours',
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

    if (loading) {
        return 'Loading...'
    } else {
        return (
            <>
            <Card>
                <ColGrid numColsSm={ 3 } numColsLg={ 3 } gapX="gap-x-10" gapY="gap-y-10">
                    { firstGroup.map((item) => (
                        <Flex justifyContent="justify-start" spaceX="space-x-4">
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
            <ColGrid numColsSm={ 3 } numColsLg={ 3 } gapX="gap-x-10" gapY="gap-y-10">
                { secondGroup.map((item) => (
                    <Flex justifyContent="justify-start" spaceX="space-x-4">
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
};

function process(data) {
    let totalSessions = 0;
    let totalHours = 0;
    let uniquePartners = new Set();

    data.sort((a, b) => {
        return new Date(a.startTime) - new Date(b.startTime);
    });

    let currentPartner = '';
    let currentDate = '';
    let currentHoursADay = 0;
    let maxHoursADay = 0;
    for (let index in data) {
        if (data[index].users[0].completed === true) {
            totalSessions += 1;
            totalHours += data[index].duration / 3600000;

            if (currentDate === data[index].startTime.substring(0, 10)) {
                currentHoursADay += data[index].duration / 3600000;
            } else {
                if (currentHoursADay > maxHoursADay) {
                    maxHoursADay = currentHoursADay;
                };
                currentHoursADay = data[index].duration / 3600000;
                currentDate = data[index].startTime.substring(0, 10);
            };

            if (typeof data[index].users[1] !== 'undefined') {
                currentPartner = data[index].users[1].userId;
                if (!uniquePartners.has(currentPartner)) {
                    uniquePartners.add(currentPartner)       
                }
            }
        }
    };

    return [
        totalSessions.toLocaleString(),
        Math.round(totalHours).toLocaleString(),
        uniquePartners.size.toLocaleString(),
        data[0] ? new Date(data[0].startTime).toLocaleString("en-US", { day: "numeric", month: "short", year: "numeric" }) : 'N/A',
        Math.round(maxHoursADay).toLocaleString(),
    ];
};

