import { expect } from 'vitest';
import { toHaveNoViolations } from 'jest-axe';

// Register jest-axe matchers only in the test runtime
expect.extend(toHaveNoViolations);
