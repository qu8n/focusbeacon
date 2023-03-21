import { RefreshIcon } from "@heroicons/react/outline";
import { Badge, Divider, Text } from "@tremor/react";
import React from "react";
import PropTypes from "prop-types";

Footer.propTypes = {
  data: PropTypes.string.isRequired
};

export default function Footer({ data }) {
  const updateTime = data;
  return (
    <>
      <Divider />
      <div className={"mt-5 flex justify-center"}>
        <Badge
          text={"Last refreshed on " + updateTime}
          color="yellow"
          size="sm"
          icon={RefreshIcon}
          marginTop="mt-3"
        />
      </div>
      <div className={"mt-4 mb-10 flex justify-center"}>
        <Text>
          Made with 🧋 by&nbsp;
          <a
            className="text-blue-500 hover:text-blue-600"
            href="https://www.quans.org/"
            target="_blank"
            rel="noreferrer"
          >
            Quan
          </a>
        </Text>
      </div>
    </>
  );
}
