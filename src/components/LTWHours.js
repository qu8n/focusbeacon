import { Card, Title, Subtitle, AreaChart } from "@tremor/react";

export default function LTWHours({data}) {
    const lTWHoursArr = data;

    const dataFormatter = (number) => {
        return Intl.NumberFormat("us").format(number).toString();
    };

    return (
        <Card>
            <Title>Weekly Hours of Sessions</Title>
            <Subtitle>
                Over the last 12 weeks
            </Subtitle>
            <AreaChart
                data={lTWHoursArr}
                categories={["Hours of Sessions"]}
                dataKey="Week of"
                colors={["blue"]}
                valueFormatter={dataFormatter}
                yAxisWidth="w-10"
                showLegend={false}
                height="h-80"
                marginTop="mt-6"
                startEndOnly={true}
            />
        </Card>
    );
};