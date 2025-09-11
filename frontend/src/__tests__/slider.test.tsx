import { render, screen, fireEvent } from "@testing-library/react";
import React from "react";
import { AutonomySlider } from "../components/AutonomySlider";

describe("AutonomySlider", () => {
  it("renders and changes value", () => {
    let v=0;
    render(<AutonomySlider value={v} onChange={(x)=>{v=x;}} />);
    const input = screen.getByRole("slider");
    fireEvent.change(input, { target: { value: "2" } });
    expect(v).toBe(2);
  });
});
