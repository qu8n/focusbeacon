/* eslint-disable no-undef */
import React from "react";
import { render, screen } from "@testing-library/react";
import Home from "../pages/index";

test("renders learn react link", () => {
  render(<Home />);
  const linkElement = screen.getByText(/learn react/i);
  expect(linkElement).toBeInTheDocument();
});
