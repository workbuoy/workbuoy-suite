// Unified logger alias:
// This file re-exports the canonical logger from src/core/logging/logger.ts
// so all legacy imports `from "../../core/logger"` now resolve to the same implementation.
export * from "./logging/logger";
export { default } from "./logging/logger";
