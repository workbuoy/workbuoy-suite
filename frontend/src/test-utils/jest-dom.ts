import { expect } from "vitest";

declare module "vitest" {
  interface Assertion<T = any> {
    toBeInTheDocument(): T;
  }
}

expect.extend({
  toBeInTheDocument(received: HTMLElement) {
    const pass = !!received && document.body.contains(received);
    return {
      pass,
      message: () =>
        pass
          ? "Expected element not to be in the document"
          : "Expected element to be present in the document",
    };
  },
});
