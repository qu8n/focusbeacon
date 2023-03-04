import { BarChart, Card, Title, Subtitle } from "@tremor/react";

export default function LTWSessions({data}) {
    const lTWSessionsArr = data;

    const dataFormatter = (number) => {
        return Intl.NumberFormat("us").format(number).toString();
    };

    return (
        <Card>
            <Title>Weekly Number of Sessions</Title>
            <Subtitle>
                Over the last 12 weeks
            </Subtitle>
            <BarChart
                data={lTWSessionsArr}
                dataKey="Week of"
                categories={["Number of Sessions"]}
                colors={["blue"]}
                valueFormatter={dataFormatter}
                marginTop="mt-6"
                yAxisWidth="w-10"
                showLegend={false}
                startEndOnly={true}
            />
        </Card>
    );
};