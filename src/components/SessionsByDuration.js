import {
    Card,
    Flex,
    List,
    ListItem,
    Title,
    Text,
    DonutChart
} from '@tremor/react';

export default function SessionsByDuration({data}) {
    const [sessionsByDurationArr, totalSessions] = data;

    const valueFormatter = (number) => (
        `${Intl.NumberFormat('us').format(number).toString()}`
    );

    return (
        <Card>
            <Flex spaceX="space-x-8" justifyContent="justify-start" alignItems="items-center">
                <Title>Sessions by Duration</Title>
            </Flex>

            <DonutChart
                data={ sessionsByDurationArr }
                dataKey="duration"
                category="sessions"
                variant='pie'
                colors={ ["blue", "orange", "yellow"] }
                valueFormatter={ valueFormatter }
                marginTop="mt-6"
                height="h-44"
            />

            <List marginTop="mt-6">
                { sessionsByDurationArr.map((data) => (
                    <ListItem key={ data.duration }>
                        { durationColors[data.duration] } &nbsp; { data.duration }
                        <Text>
                            { Intl.NumberFormat('us').format(data.sessions).toString() } sessions
                            ({ Math.round(data.sessions / totalSessions * 100) }%)
                        </Text>
                    </ListItem>
                )) }
            </List>
        </Card>
    );
};

const durationColors = {
    '25 minutes': "🔵",
    '50 minutes': "🟠",
    '75 minutes': "🟡",
};

