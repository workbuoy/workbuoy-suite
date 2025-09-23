import React from "react";
import { renderToStaticMarkup } from "react-dom/server";
import { describe, expect, it } from "vitest";
import { WhyDrawer } from "@/components/WhyDrawer";

describe("WhyDrawer", () => {
  it("shows reason and confidence", () => {
    const markup = renderToStaticMarkup(
      <WhyDrawer explanations={[{ reason: "Denied", confidence: 0.56 }]} />,
    );
    expect(markup).toContain("Denied");
    expect(markup).toContain("Confidence: 56%");
  });
});
