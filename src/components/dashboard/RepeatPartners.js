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
  Flex
} from "@tremor/react";
import { UserIcon, UsersIcon, UserGroupIcon } from "@heroicons/react/solid";
import { InformationCircleIcon } from "@heroicons/react/outline";
import React from "react";
import PropTypes from "prop-types";

RepeatPartners.propTypes = {
  data: PropTypes.arrayOf(PropTypes.object).isRequired
};

export default function RepeatPartners({ data }) {
  const repeatPartnersArr = data;

  return (
    <Card>
      <Flex alignItems="align-top">
        <Title>Top recurring partners</Title>
        <Icon
          icon={InformationCircleIcon}
          variant="simple"
          tooltip="View more details at focusmate.com/people, where you can sort by 'Sessions together'.
                        Note that deleted accounts are counted as one-session partners"
          color="slate"
        />
      </Flex>
      <Table marginTop="mt-4">
        <TableHead>
          <TableRow>
            <TableHeaderCell textAlignment="text-left">
              Shared sessions
            </TableHeaderCell>
            <TableHeaderCell textAlignment="text-right">
              No. of partners
            </TableHeaderCell>
          </TableRow>
        </TableHead>

        <TableBody>
          {repeatPartnersArr.map((sharedSession) => (
            <TableRow key={sharedSession.sharedSessions}>
              <TableCell textAlignment="">
                {sharedSession.sharedSessions.toLocaleString()}{" "}
                {sharedSession.sharedSessions > 1 ? "sessions" : "session"}
              </TableCell>
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

PartnerIcons.propTypes = {
  sharedSession: PropTypes.object.isRequired
};

function PartnerIcons({ sharedSession }) {
  if (sharedSession.partners === 1) {
    return (
      <Flex justifyContent="justify-end" marginTop="-mt-1">
        1
        <Icon
          size={"s"}
          icon={UserIcon}
          color={"gray"}
          variant={"simple"}
          marginTop="-mt-1"
        />
      </Flex>
    );
  } else if (sharedSession.partners === 2) {
    return (
      <Flex justifyContent="justify-end" marginTop="-mt-1">
        2
        <Icon
          size={"s"}
          icon={UsersIcon}
          color={"gray"}
          variant={"simple"}
          marginTop="-mt-1"
        />
      </Flex>
    );
  } else {
    return (
      <Flex justifyContent="justify-end" marginTop="-mt-1">
        {sharedSession.partners}
        <Icon
          size={"s"}
          icon={UserGroupIcon}
          color={"gray"}
          variant={"simple"}
          marginTop="-mt-1"
        />
      </Flex>
    );
  }
}
