import { BarChart, Card, Title, Subtitle } from "@tremor/react";

export default function LTMHours({data}) {
    const [loading, lTMHoursArr] = data;

    const dataFormatter = (number) => {
        return Intl.NumberFormat("us").format(number).toString();
    };

    if (loading) {
        return 'Loading...';
    } else {
        return (
            <Card>
                <Title>Hours of Sessions Trend</Title>
                <Subtitle>
                    Over the last 12 months
                </Subtitle>
                <BarChart
                    data={lTMHoursArr}
                    dataKey="Month"
                    categories={["Hours of Sessions"]}
                    colors={["indigo"]}
                    valueFormatter={dataFormatter}
                    marginTop="mt-6"
                    yAxisWidth="w-12"
                    showLegend={false}
                    startEndOnly={true}
                />
            </Card>
        );
    };
};