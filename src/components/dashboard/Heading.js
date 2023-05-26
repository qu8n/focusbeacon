import React from "react";
import PropTypes from "prop-types";

Heading.propTypes = {
  title: PropTypes.string.isRequired,
  subtitle: PropTypes.string
};

export function Heading({ title, subtitle }) {
  return (
    <div className="text-slate-500">
      <p className="text-3xl font-semibold">{title}</p>
      {subtitle && <p className="font-normal text-md">{subtitle}</p>}
    </div>
  );
}
