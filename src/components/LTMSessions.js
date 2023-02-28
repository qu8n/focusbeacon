import { BarChart, Card, Title, Subtitle } from "@tremor/react";

export default function LTMSessions({data}) {
    const [loading, lTMSessionsArr] = data;

    const dataFormatter = (number) => {
        return Intl.NumberFormat("us").format(number).toString();
    };

    if (loading) {
        return 'Loading...';
    } else {
        return (
            <Card>
                <Title>Sessions Trend</Title>
                <Subtitle>
                    Over the last 12 months
                </Subtitle>
                <BarChart
                    data={lTMSessionsArr}
                    dataKey="Month"
                    categories={["Number of Sessions"]}
                    colors={["indigo"]}
                    valueFormatter={dataFormatter}
                    marginTop="mt-6"
                    yAxisWidth="w-10"
                    showLegend={false}
                    startEndOnly={true}
                />
            </Card>
        );
    };
};