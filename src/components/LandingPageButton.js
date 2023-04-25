import React from "react";
import PropTypes from "prop-types";
import { useRouter } from "next/router";

LandingPageButton.propTypes = {
  link: PropTypes.string.isRequired,
  icon: PropTypes.any, // TODO: specify typing of svg element
  text: PropTypes.string.isRequired,
  theme: PropTypes.string.isRequired
};

export default function LandingPageButton({ link, icon, text, theme }) {
  const router = useRouter();
  return (
    <>
      <button
        onClick={() => {
          if (typeof window !== "undefined") {
            router.push(`${link}`);
          }
        }}
        className={`w-72 items-center text-center text-lg h-14 font-normal px-3 rounded ${theme}`}
      >
        {icon}
        {text}
      </button>
    </>
  );
}
