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
import { ChatIcon, UserIcon, UsersIcon, UserGroupIcon } from '@heroicons/react/solid';

export default function RepeatPartners({data}) {
    const [loading, repeatPartnersArr] = data;

    if (loading) {
        return 'Loading...';
    } else {
        return (
            <Card>
                <Flex alignItems="align-top">
                    <Title>Top Recurring Partners</Title>
                    <Icon
                        icon={ChatIcon}
                        variant="light"
                        tooltip="View more details at focusmate.com/people, where you can sort by 'Sessions together'.
                            Note that deleted accounts are counted as one-session partners."
                        color="gray"
                    />
                </Flex>
                <Table marginTop="mt-4">
                    <TableHead>
                        <TableRow>
                            <TableHeaderCell textAlignment="text-left">Shared Sessions</TableHeaderCell>
                            <TableHeaderCell textAlignment="text-right">No. of Partners</TableHeaderCell>
                        </TableRow>
                    </TableHead>

                    <TableBody>
                        { repeatPartnersArr.map((sharedSession) => (
                        <TableRow key={ sharedSession.sharedSessions }>
                            <TableCell textAlignment="">{ sharedSession.sharedSessions.toLocaleString() } { sharedSession.sharedSessions > 1 ? 'sessions' : 'session' }</TableCell>
                            <TableCell textAlignment="text-right">
                                <PartnerIcons sharedSession={sharedSession} />
                            </TableCell>
                        </TableRow>
                        ))}
                    </TableBody>
                </Table>
            </Card>
        );
    }
};

function PartnerIcons({sharedSession}) {
    if (sharedSession.partners === 1) {
        return (
            <Flex justifyContent="justify-end"  marginTop="-mt-1">
                1
                <Icon size={"s"} icon={UserIcon} color={"gray"} variant={"simple"}  marginTop="-mt-1"/>
            </Flex>
        );
    } else if (sharedSession.partners === 2) {
        return (
            <Flex justifyContent="justify-end"  marginTop="-mt-1">
                2
                <Icon size={"s"} icon={UsersIcon} color={"gray"} variant={"simple"}  marginTop="-mt-1"/>
            </Flex>
        );
    } else {
        return (
            <Flex justifyContent="justify-end"  marginTop="-mt-1">
                {sharedSession.partners}
                <Icon size={"s"} icon={UserGroupIcon} color={"gray"} variant={"simple"}  marginTop="-mt-1"/>
            </Flex>
        );
    }
};



