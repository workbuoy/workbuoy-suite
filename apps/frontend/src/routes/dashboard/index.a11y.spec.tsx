import React from "react";
import { render } from "@testing-library/react";
import { describe, expect, it } from "vitest";

import { axe } from "../../test-utils/axe";
import DashboardRoute from "./index";

describe("Dashboard accessibility axe audit", () => {
  it("renders without axe violations", async () => {
    const { container } = render(<DashboardRoute />);
    const results = await axe(container);
    expect(results).toHaveNoViolations();
  });
});
