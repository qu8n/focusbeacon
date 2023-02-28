import { BarChart, Card, Title, Subtitle } from "@tremor/react";

export default function LTMMinutes({data}) {
    const [loading, lTMMinutesArr] = data;

    const dataFormatter = (number) => {
        return Intl.NumberFormat("us").format(number).toString();
    };

    if (loading) {
        return 'Loading...';
    } else {
        return (
            <Card>
                <Title>Minutes of Sessions Trend</Title>
                <Subtitle>
                    Minutes of sessions in the last completed 12 months
                </Subtitle>
                <BarChart
                    data={lTMMinutesArr}
                    dataKey="Month"
                    categories={["Minutes of Sessions"]}
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