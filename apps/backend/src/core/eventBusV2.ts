import { EventEmitter } from "events";
import { createRequire } from "module";

export type EventBus = {
  on(event: string, listener: (...args: any[]) => void): any;
  emit(event: string, ...args: any[]): boolean;
};

const require = createRequire(import.meta.url);
let shared: EventBus | undefined;
try {
  // Use optional runtime require; TypeScript types are provided via ambient declaration.
  // eslint-disable-next-line @typescript-eslint/no-var-requires
  // @ts-ignore – path exists in monorepo but not in isolated builds
  shared = require("../../../src/core/eventBusV2.js")?.eventBus as EventBus | undefined;
} catch {
  // ignore – fall back to local emitter
}

export const eventBus: EventBus = shared ?? (new EventEmitter() as unknown as EventBus);
