import {
    Table,
    TableHead,
    TableHeaderCell,
    TableBody,
    TableRow,
    TableCell,
    Card,
    Title,
    Text,
    Footer,
  } from "@tremor/react";

export default function RepeatPartners({data}) {
    const [loading, repeatPartnersArr] = data;

    if (loading) {
        return 'Loading...';
    } else {
        return (
            <Card>
            <Title>Repeat Session Partners</Title>
            <Table marginTop="mt-5">
                <TableHead>
                    <TableRow>
                        <TableHeaderCell textAlignment="text-left">Shared Sessions</TableHeaderCell>
                        <TableHeaderCell textAlignment="text-right">Number of Partners</TableHeaderCell>
                    </TableRow>
                </TableHead>

                <TableBody>
                    { repeatPartnersArr.map((sharedSession) => (
                    <TableRow key={ sharedSession.sharedSessions }>
                        <TableCell textAlignment="">{ sharedSession.sharedSessions.toLocaleString() } { sharedSession.sharedSessions > 1 ? 'sessions' : 'session' }</TableCell>
                        <TableCell textAlignment="text-right">{ sharedSession.partners.toLocaleString() }</TableCell>
                    </TableRow>
                    ))}
                </TableBody>
            </Table>
            </Card>
        );
    }
};


