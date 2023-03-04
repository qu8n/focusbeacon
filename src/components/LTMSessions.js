import { BarChart, Card, Title } from "@tremor/react";

export default function LTMSessions({data}) {
    const lTMSessionsArr = data;

    const dataFormatter = (number) => {
        return Intl.NumberFormat("us").format(number).toString();
    };

    return (
        <Card>
            <Title>Number of Sessions</Title>
            <BarChart
                data={lTMSessionsArr}
                dataKey="Month"
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