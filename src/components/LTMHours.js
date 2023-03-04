import { Card, Title, AreaChart } from "@tremor/react";

export default function LTMHours({data}) {
    const lTMHoursArr = data;

    const dataFormatter = (number) => {
        return Intl.NumberFormat("us").format(number).toString();
    };

    return (
        <Card>
            <Title>Hours of Sessions</Title>
            <AreaChart
                data={lTMHoursArr}
                categories={["Hours of Sessions"]}
                dataKey="Month"
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