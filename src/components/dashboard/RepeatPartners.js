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
import { getCompletedSessions } from '../../utils/getCompletedSessions';

RepeatPartners.propTypes = {
  sessionsData: PropTypes.arrayOf(PropTypes.object).isRequired
};

export function RepeatPartners({ sessionsData }) {
  const repeatPartnersObj = {};
  let repeatPartnersArr = [];

  const partnerIdsArr = Object.values(
    sessionsData.reduce((acc, session) => {
      if (session.users[1]?.userId && session.users[0].completed === true) {
        if (acc[session.users[1]?.userId]) {
          acc[session.users[1]?.userId] += 1;
        } else {
          acc[session.users[1]?.userId] = 1;
        }
      }
      return acc;
    }, {})
  );

  for (let i = 0; i < partnerIdsArr.length; i++) {
    repeatPartnersObj[partnerIdsArr[i]] =
      (repeatPartnersObj[partnerIdsArr[i]] || 0) + 1;
  }

  for (let i in repeatPartnersObj) {
    repeatPartnersArr.push({
      sharedSessions: parseInt(i),
      partners: repeatPartnersObj[i]
    });
  }

  repeatPartnersArr = structuredClone(repeatPartnersArr).reverse().slice(0, 5);

  return (
    <Card>
      <Flex className="align-top">
        <Title>Top repeat partners</Title>
        <Icon
          icon={InformationCircleIcon}
          variant="simple"
          tooltip="View more details at focusmate.com/people, where you can sort by 'Sessions together'.
                        Note that deleted accounts are counted as one-session partners"
          color="slate"
        />
      </Flex>
      <Table className="mt-4">
        <TableHead>
          <TableRow>
            <TableHeaderCell>Shared sessions</TableHeaderCell>
            <TableHeaderCell className="text-right">
              No. of partners
            </TableHeaderCell>
          </TableRow>
        </TableHead>

        <TableBody>
          {repeatPartnersArr.map((sharedSession) => (
            <TableRow key={sharedSession.sharedSessions}>
              <TableCell>
                {sharedSession.sharedSessions.toLocaleString()}{" "}
                {sharedSession.sharedSessions > 1 ? "sessions" : "session"}
              </TableCell>
              <TableCell className="text-right">
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
      <Flex className="justify-end -mt-1">
        1
        <Icon
          size={"sm"}
          icon={UserIcon}
          color={"gray"}
          variant={"simple"}
          className="-mt-1"
        />
      </Flex>
    );
  } else if (sharedSession.partners === 2) {
    return (
      <Flex className="justify-end -mt-1">
        2
        <Icon
          size={"sm"}
          icon={UsersIcon}
          color={"gray"}
          variant={"simple"}
          className="-mt-1"
        />
      </Flex>
    );
  } else {
    return (
      <Flex className="justify-end -mt-1">
        {sharedSession.partners}
        <Icon
          size={"sm"}
          icon={UserGroupIcon}
          color={"gray"}
          variant={"simple"}
          className="-mt-1"
        />
      </Flex>
    );
  }
}
