import { InformationCircleIcon } from "@heroicons/react/outline";
import { Card, Title, AreaChart, Text, Flex, Icon } from "@tremor/react";

export default function LTMHours({data}) {
    const lTMHoursArr = data;

    const dataFormatter = (number) => {
        return Intl.NumberFormat("us").format(number).toString();
    };

    return (
        <Card>
            <Flex alignItems="align-top">
                <Title>Monthly Hours of Sessions</Title>
                <Icon
                    icon={InformationCircleIcon}
                    variant="simple"
                    tooltip="Each x-axis marker represents a month and its respective year"
                    color="slate"
                />
            </Flex>
            <AreaChart
                data={lTMHoursArr}
                categories={["Hours of Sessions"]}
                dataKey="Month"
                colors={["blue"]}
                valueFormatter={dataFormatter}
                yAxisWidth="w-8"
                showLegend={false}
                height="h-80"
                marginTop="mt-6"
            />
            <Text textAlignment='text-center'>Month</Text>
        </Card>
    );
};