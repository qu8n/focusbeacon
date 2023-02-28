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
                    Number of sessions in the last completed 12 months
                </Subtitle>
                <BarChart
                    data={lTMSessionsArr}
                    dataKey="Month"
                    categories={["Number of Sessions"]}
                    colors={["indigo"]}
                    valueFormatter={dataFormatter}
                    marginTop="mt-6"
                    yAxisWidth="w-12"
                    showLegend={false}
                />
            </Card>
        );
    };
};