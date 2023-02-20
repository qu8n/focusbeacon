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
    CashIcon,
    TicketIcon,
    UserGroupIcon,
} from '@heroicons/react/solid';

import React from 'react';

const categories = [
    {
        title: 'Sales',
        metric: '$ 23,456,456',
        icon: TicketIcon,
        color: 'indigo',
    },
    {
        title: 'Profit',
        metric: '$ 13,123',
        icon: CashIcon,
        color: 'fuchsia',
    },
    {
        title: 'Customers',
        metric: '456',
        icon: UserGroupIcon,
        color: 'amber',
    },
    {
        title: 'Customers',
        metric: '456',
        icon: UserGroupIcon,
        color: 'amber',
    },
];

export default function Example() {
    return (
        <ColGrid numColsSm={ 2 } numColsLg={ 4 } gapX="gap-x-6" gapY="gap-y-6">
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