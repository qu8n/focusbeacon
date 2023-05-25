import {
  Table,
  TableHead,
  TableHeaderCell,
  TableBody,
  TableRow,
  TableCell,
  Card,
  Title
} from "@tremor/react";
import React from "react";
import PropTypes from "prop-types";

RecentMilestones.propTypes = {
  sessionsData: PropTypes.arrayOf(PropTypes.object).isRequired,
  lifetimeTotalSessions: PropTypes.number.isRequired
};

export function RecentMilestones({ sessionsData, lifetimeTotalSessions }) {
  const milestoneSessions = [];
  let currentMilestone = 0;
  const milestoneLevelsAndUnits = {
    25: 1,
    50: 5,
    125: 10,
    250: 25,
    500: 50,
    1250: 100,
    2500: 250,
    100000: 500
  };
  const milestoneUpperLevel = Object.keys(milestoneLevelsAndUnits).find(
    (key) => key > lifetimeTotalSessions
  );
  const unit = milestoneLevelsAndUnits[milestoneUpperLevel];
  currentMilestone = Math.floor(lifetimeTotalSessions / unit) * unit;
  for (
    let i = 0;
    i < Math.min(Math.floor(lifetimeTotalSessions / unit), 5);
    i++
  ) {
    milestoneSessions.push(currentMilestone);
    currentMilestone -= unit;
  }
  const milestonesArr = sessionsData
    .filter((session) => session.users[0].completed === true)
    .toReversed()
    .reduce((acc, session, sessionsCounter) => {
      if (milestoneSessions.includes(sessionsCounter + 1)) {
        acc.push({ milestone: sessionsCounter + 1, date: session.startTime });
      }
      return acc;
    }, [])
    .toReversed();

  return (
    <Card>
      <Title>Recent milestones</Title>
      <Table className="mt-5">
        <TableHead>
          <TableRow>
            <TableHeaderCell>Milestone</TableHeaderCell>
            <TableHeaderCell className="text-right">Date</TableHeaderCell>
          </TableRow>
        </TableHead>

        <TableBody>
          {milestonesArr.map((milestone) => (
            <TableRow key={milestone.milestone}>
              <TableCell>
                {milestone.milestone.toLocaleString()}{" "}
                {milestone.milestone > 1 ? "sessions" : "session"}
              </TableCell>
              <TableCell className="text-right">
                {new Date(milestone.date).toLocaleDateString("en-US", {
                  month: "long",
                  day: "numeric",
                  year: "numeric"
                })}
              </TableCell>
            </TableRow>
          ))}
        </TableBody>
      </Table>
    </Card>
  );
}
