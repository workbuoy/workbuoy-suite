import "@testing-library/jest-dom";
import { afterEach } from "vitest";
import { cleanup } from "@testing-library/react";
import { installDom } from "./src/test-utils/domShim";

// Enable React act() warnings integration
(globalThis as any).IS_REACT_ACT_ENVIRONMENT = true;

installDom();

afterEach(() => {
  cleanup();
});
