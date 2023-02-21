import {
    Card,
    Flex,
    List,
    ListItem,
    Title,
    Text,
    BarChart
} from '@tremor/react';

const valueFormatter = (number) => (
    `${Intl.NumberFormat('us').format(number).toString()}`
);

export default function SessionsByDuration(props) {
    const [loading, data] = props.data;
    const [tableData, totalSessions] = process(data);

    if (loading) {
        return 'Loading...';
    } else {
        return (
            <Card maxWidth="max-w-md">
                <Flex spaceX="space-x-8" justifyContent="justify-start" alignItems="items-center">
                    <Title>Sessions by Duration</Title>
                </Flex>

                <BarChart
                    data={ tableData }
                    dataKey="duration"
                    categories={ ["sessions"] }
                    colors={ ["indigo"] }
                    valueFormatter={ valueFormatter }
                    marginTop="mt-6"
                    yAxisWidth="w-12"
                    showLegend={ false }
                    height="h-48"
                />

                <List marginTop="mt-6">
                    { tableData.map((data) => (
                        <ListItem key={ data.duration }>
                            { data.duration }
                            <Text>
                                { Intl.NumberFormat('us').format(data.sessions).toString() } sessions
                                ({ Math.round(data.sessions / totalSessions * 100) }%)
                            </Text>
                        </ListItem>
                    )) }
                </List>
            </Card>
        );
    }
};

function process(data) {
    let table = {
        '25 minutes': 0,
        '50 minutes': 0,
        '75 minutes': 0,
    };
    let totalSessions = 0;
    const modifiedTable = [];

    for (let index in data) {
        if (data[index].users[0].completed === true) {
            totalSessions += 1;
            table[`${data[index].duration / 60000} minutes`] += 1;
        }
    };

    for (const [key, value] of Object.entries(table)) {
        modifiedTable.push({
            duration: key,
            sessions: value
        });
    };

    return [modifiedTable, totalSessions];
};

