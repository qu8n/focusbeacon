import { InformationCircleIcon } from "@heroicons/react/outline";
import { BarChart, Card, Flex, Icon, Text, Title } from "@tremor/react";

export default function LTMSessions({data}) {
    const lTMSessionsArr = data;

    const dataFormatter = (number) => {
        return Intl.NumberFormat("us").format(number).toString();
    };

    return (
        <Card>
            <Flex alignItems="align-top">
                <Title>Sessions by Month</Title>
                <Icon
                    icon={InformationCircleIcon}
                    variant="simple"
                    tooltip="Each x-axis marker represents a month and its respective year"
                    color="slate"
                />
            </Flex>
            <BarChart
                data={lTMSessionsArr}
                dataKey="Month"
                categories={["Number of Sessions"]}
                colors={["blue"]}
                valueFormatter={dataFormatter}
                marginTop="mt-6"
                yAxisWidth="w-8"
                showLegend={false}
            />
            <Text textAlignment='text-center'>Month</Text>
        </Card>
    );
};