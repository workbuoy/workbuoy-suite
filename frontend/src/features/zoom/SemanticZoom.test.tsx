import { fireEvent, render, screen } from "@testing-library/react";
import React from "react";
import SemanticZoom from "./SemanticZoom";

test("switches levels and groups items", () => {
  render(<SemanticZoom />);

  fireEvent.keyDown(window, { key: "2" });
  expect(screen.getByRole("group", { name: /Uke/ })).toBeInTheDocument();

  fireEvent.keyDown(window, { key: "3" });
  expect(screen.getByText(/Salg/)).toBeInTheDocument();
});
