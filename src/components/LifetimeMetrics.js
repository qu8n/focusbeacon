import React from 'react';
import 'ag-grid-community/styles/ag-grid.css';
import 'ag-grid-community/styles/ag-theme-alpine.css';
import { Card, Metric, Text, Icon, Flex, Block, ColGrid } from '@tremor/react';
import { ClockIcon, VideoCameraIcon, UsersIcon } from '@heroicons/react/solid';

export default function LifetimeMetrics(props) {
    const [loading, data] = props.data;

    const [totalSessions, totalHours, uniquePartners] = process(data);

    const categories = [
        {
            title: 'Total Sessions',
            metric: totalSessions,
            icon: VideoCameraIcon,
            color: 'indigo',
        },
        {
            title: 'Total Hours',
            metric: totalHours,
            icon: ClockIcon,
            color: 'amber',
        },
        {
            title: 'Total Unique Partners',
            metric: uniquePartners,
            icon: UsersIcon,
            color: 'orange',
        },
    ];

    if (loading) {
        return 'Loading...'
    } else {
        return (
            <ColGrid numColsSm={ 3 } numColsLg={ 3 } gapX="gap-x-6" gapY="gap-y-6">
                { categories.map((item) => (
                    <Card key={ item.title } decoration="top" decorationColor={ item.color }>
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
        uniquePartners.size.toLocaleString()
    ];
};

