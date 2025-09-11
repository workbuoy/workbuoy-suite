import { render, screen } from "@testing-library/react";
import React from "react";
import { WhyDrawer } from "../components/WhyDrawer";

describe("WhyDrawer", () => {
  it("shows reason and confidence", () => {
    render(<WhyDrawer explanations={[{ reason:"Denied", confidence:0.56 }]} />);
    expect(screen.getByText(/Denied/)).toBeInTheDocument();
    expect(screen.getByText(/Confidence:/)).toBeInTheDocument();
  });
});
