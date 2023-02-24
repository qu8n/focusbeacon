import {
    Table,
    TableHead,
    TableHeaderCell,
    TableBody,
    TableRow,
    TableCell,
    Card,
    Title,
    Icon,
    Flex,
  } from "@tremor/react";
import { ChatIcon } from '@heroicons/react/solid';

export default function RepeatPartners({data}) {
    const [loading, repeatPartnersArr] = data;

    if (loading) {
        return 'Loading...';
    } else {
        return (
            <Card>
                <Flex alignItems="align-top">
                    <Title>Repeat Session Partners</Title>
                    <Icon
                        icon={ChatIcon}
                        variant="simple"
                        tooltip="More details available at focusmate.com/people, where you can sort by 'Sessions together'.
                            Note that deleted accounts are counted as one-session partners."
                        color="gray"
                    />
                </Flex>
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


