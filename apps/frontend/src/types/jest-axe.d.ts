import type { AxeResults, RunOptions, Spec } from 'axe-core';

declare module 'jest-axe' {
  export const axe: (
    container: Element | DocumentFragment,
    options?: RunOptions
  ) => Promise<AxeResults>;
  export const configureAxe: (config?: Spec) => typeof axe;
  export const toHaveNoViolations: (results?: AxeResults) => void;
}

declare module 'vitest' {
  interface Assertion<T = any> {
    toHaveNoViolations(): T;
  }
  interface AsymmetricMatchersContaining {
    toHaveNoViolations(): void;
  }
}
