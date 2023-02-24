import {
    Card,
    Flex,
    List,
    ListItem,
    Title,
    Text,
    BarChart
} from '@tremor/react';

export default function SessionsByDuration({data}) {
    const [loading, [sessionsByDurationArr, totalSessions]] = data;

    const valueFormatter = (number) => (
        `${Intl.NumberFormat('us').format(number).toString()}`
    );

    if (loading) {
        return 'Loading...';
    } else {
        return (
            <Card>
                <Flex spaceX="space-x-8" justifyContent="justify-start" alignItems="items-center">
                    <Title>Sessions by Duration</Title>
                </Flex>

                <BarChart
                    data={ sessionsByDurationArr }
                    dataKey="duration"
                    categories={ ["sessions"] }
                    colors={ ["indigo"] }
                    valueFormatter={ valueFormatter }
                    marginTop="mt-6"
                    yAxisWidth="w-12"
                    showLegend={ false }
                    height="h-56"
                />

                <List marginTop="mt-6">
                    { sessionsByDurationArr.map((data) => (
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


