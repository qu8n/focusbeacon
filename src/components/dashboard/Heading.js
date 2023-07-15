import React from "react";
import { string } from "prop-types";

Heading.propTypes = {
  title: string.isRequired,
  subtitle: string,
};

export function Heading({ title, subtitle }) {
  return (
    <>
      <p className="text-3xl font-semibold">{title}</p>
      {subtitle && <p className="font-normal text-md">{subtitle}</p>}
    </>
  );
}
