import React from "react";
import { describe, expect, it, vi } from "vitest";
import { AutonomySlider } from "@/components/AutonomySlider";

describe("AutonomySlider", () => {
  it("invokes the change handler with numeric values", () => {
    const onChange = vi.fn();
    const element = AutonomySlider({ value: 0, onChange });
    const [, input] = (element.props.children as React.ReactNode[]) as any[];
    input.props.onChange({ target: { value: "2" } });
    expect(onChange).toHaveBeenCalledWith(2);
  });
});
