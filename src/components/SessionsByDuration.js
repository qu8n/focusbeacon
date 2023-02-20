import React from 'react';
import { Card, Title, ProgressBar, Text, Flex, Block } from '@tremor/react';

export default function Example(props) {
    const [loading, data] = props.data;

    const tableData = process(data);

    if (loading) {
        return 'Loading...';
    } else {
        return (
            <Card>
                <Flex alignItems="items-start">
                    <Title>Sessions by Duration</Title>
                </Flex>
                {tableData.map((item) => (
                    <Block key={ item.duration } marginTop="mt-4" spaceY="space-y-2">
                        <Flex>
                            <Text>{ item.duration }</Text>
                            <Text>{ `${item.sessions} (${item.percentage}%)` }</Text>
                        </Flex>
                        <ProgressBar percentageValue={ item.percentage } />
                    </Block>
                ))}
            </Card>
        );
    }
}

function process(data) {
    let table = {
        '25 minutes': 0,
        '50 minutes': 0,
        '75 minutes': 0,
    };

    let totalSessions = 0;

    for (let index in data) {
        if (data[index].users[0].completed === true) {
            totalSessions += 1;
            table[`${data[index].duration / 60000} minutes`] += 1;
        }
    };

    const agTableData = [];

    for (const [key, value] of Object.entries(table)) {
        agTableData.push({
            duration: key,
            sessions: value.toLocaleString(),
            percentage: Math.round(value / totalSessions * 100)
        });
    };

    return agTableData;
};

