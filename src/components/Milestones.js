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

export default function Milestones({data}) {
    const milestonesArr = data;

    return (
        <Card>
        <Title>Recent Milestones</Title>
        <Table marginTop="mt-5">
            <TableHead>
                <TableRow>
                    <TableHeaderCell textAlignment="text-left">Milestone</TableHeaderCell>
                    <TableHeaderCell textAlignment="text-right">Date</TableHeaderCell>
                </TableRow>
            </TableHead>

            <TableBody>
                { milestonesArr.map((milestone) => (
                <TableRow key={ milestone.milestone }>
                    <TableCell textAlignment="">{ milestone.milestone } { milestone.milestone > 1 ? 'sessions' : 'session' }</TableCell>
                    <TableCell textAlignment="text-right">{ new Date(milestone.date).toLocaleDateString('en-US', { month: 'long', day: 'numeric', year: 'numeric' }) }</TableCell>
                </TableRow>
                ))}
            </TableBody>
        </Table>
        </Card>
    );
};


