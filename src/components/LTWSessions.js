import { InformationCircleIcon } from "@heroicons/react/outline";
import { BarChart, Card, Flex, Icon, Text, Title } from "@tremor/react";

export default function LTWSessions({data}) {
    const lTWSessionsArr = data;

    const dataFormatter = (number) => {
        return Intl.NumberFormat("us").format(number).toString();
    };

    return (
        <Card>
            <Flex alignItems="align-top">
                <Title>Number of Sessions</Title>
                <Icon
                    icon={InformationCircleIcon}
                    variant="simple"
                    tooltip="Each x-axis marker represents a week, which begins on Sunday based on the Gregorian calendar"
                    color="slate"
                />
            </Flex>
            <BarChart
                data={lTWSessionsArr}
                dataKey="Week of"
                categories={["Number of Sessions"]}
                colors={["blue"]}
                valueFormatter={dataFormatter}
                marginTop="mt-6"
                yAxisWidth="w-8"
                showLegend={false}
            />
            <Text textAlignment='text-center'>Week of</Text>
        </Card>
    );
};