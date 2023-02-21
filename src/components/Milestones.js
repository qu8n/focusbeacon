import {
    Table,
    TableHead,
    TableHeaderCell,
    TableBody,
    TableRow,
    TableCell,
    Card,
    Title,
  } from "@tremor/react";

export default function Milestones(props) {
    const [loading, data] = props.data;
    const tableData = process(data);

    if (loading) {
        return 'Loading...';
    } else {
        return (
            <Card>
            <Title>Session Milestones</Title>
            <Table marginTop="mt-5">
                <TableHead>
                    <TableRow>
                        <TableHeaderCell textAlignment="text-left">Milestone</TableHeaderCell>
                        <TableHeaderCell textAlignment="text-right">Date</TableHeaderCell>
                    </TableRow>
                </TableHead>

                <TableBody>
                    { tableData.map((data) => (
                    <TableRow>
                        <TableCell textAlignment="">{ data.milestone } sessions</TableCell>
                        <TableCell textAlignment="text-right">{ new Date(data.date).toLocaleDateString('en-US', { month: 'long', day: 'numeric', year: 'numeric' }) }</TableCell>
                    </TableRow>
                    ))}
                </TableBody>
            </Table>
            </Card>
        );
    }
};

function process(data) {
    let dataArray = [];
    let milestoneSessions = [100, 200, 300, 400, 500, 600];
    let totalSessions = 0;

    // Sort the data by date, from oldest to newest, for milestones to be marked correctly
    data.sort((a, b) => {
        return new Date(a.startTime) - new Date(b.startTime);
    });

    for (let index in data) {
        if (data[index].users[0].completed === true) {
            totalSessions += 1;
            if (milestoneSessions.includes(totalSessions)) {
                let obj = { milestone: totalSessions, date: data[index].startTime };
                dataArray.push(obj);
            }

        }
    };

    return dataArray;
};

