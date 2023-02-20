import {
    Card,
    Metric,
    Text,
    Icon,
    Flex,
    Block,
    ColGrid,
} from '@tremor/react';

import {
    ClockIcon,
    VideoCameraIcon,
    UsersIcon,
    ChartPieIcon,
} from '@heroicons/react/solid';

import React from 'react';

const categories = [
    {
        title: 'Total Sessions',
        metric: '672',
        icon: VideoCameraIcon,
        color: 'indigo',
    },
    {
        title: 'Total Hours',
        metric: '546',
        icon: ClockIcon,
        color: 'amber',
    },
    {
        title: 'Total Unique Partners',
        metric: '611',
        icon: UsersIcon,
        color: 'orange',
    },
];

export default function Example() {
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
                            <Text>{ item.title }</Text>
                            <Metric truncate={ true }>{ item.metric }</Metric>
                        </Block>
                    </Flex>
                </Card>
            )) }
        </ColGrid>
    );
}