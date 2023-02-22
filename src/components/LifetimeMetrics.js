import React from 'react';
import { Card, Metric, Text, Icon, Flex, Block, ColGrid } from '@tremor/react';
import { ClockIcon, VideoCameraIcon, UsersIcon, FireIcon, BellIcon, CakeIcon } from '@heroicons/react/solid';

export default function LifetimeMetrics(props) {
    const [loading, data] = props.data;

    const [
        totalSessions, 
        totalHours, 
        totalPartners,
        firstSessionDate
    ] = process(data);

    const categories = [
        {
            title: 'Total Sessions',
            metric: totalSessions,
            icon: VideoCameraIcon
        },
        {
            title: 'Total Hours',
            metric: totalHours,
            icon: ClockIcon
        },
        {
            title: 'Total Partners',
            metric: totalPartners,
            icon: UsersIcon,
        },
        {
            title: 'Record Minutes / Day',
            metric: totalPartners,
            icon: FireIcon,
        },
        {
            title: 'First Session',
            metric: firstSessionDate,
            icon: CakeIcon,
        },
        {
            title: 'Avg. Minutes / Session',
            metric: Math.round(totalHours * 60 / totalSessions),
            icon: BellIcon,
        },
    ];

    categories.forEach((item) => {
        item.color = 'indigo';
    });

    if (loading) {
        return 'Loading...'
    } else {
        return (
            <ColGrid numColsSm={ 3 } numColsLg={ 3 } gapX="gap-x-6" gapY="gap-y-6">
                { categories.map((item) => (
                    <Card key={ item.title }>
                        <Flex justifyContent="justify-start" spaceX="space-x-4">
                            <Icon
                                icon={ item.icon }
                                variant="light"
                                size="xl"
                                color={ item.color }
                            />
                            <Block truncate={ true }>
                                <Metric truncate={ true }>{ item.metric }</Metric>
                                <Text>{ item.title }</Text>
                            </Block>
                        </Flex>
                    </Card>
                )) }
            </ColGrid>
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
    for (let index in data) {
        if (data[index].users[0].completed === true) {
            totalSessions += 1;
            totalHours += data[index].duration / 3600000;

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
        data[0] ? new Date(data[0].startTime).toLocaleString("en-US", { month: "short", year: "numeric" }) : 'N/A',
    ];
};

