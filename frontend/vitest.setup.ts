import "@testing-library/jest-dom";
import { afterEach } from "vitest";
import { cleanup } from "@testing-library/react";
import { installDom } from "./src/test-utils/domShim";

installDom();

afterEach(() => {
  cleanup();
});
