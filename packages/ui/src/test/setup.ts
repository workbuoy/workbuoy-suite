import '@testing-library/jest-dom/vitest';
import { cleanup } from '@testing-library/react';
import { afterAll, afterEach, beforeAll } from 'vitest';
import { Server } from 'node:http';

const activeIntervals = new Set<NodeJS.Timeout>();
const activeTimeouts = new Set<NodeJS.Timeout>();
const activeServers = new Set<Server>();

type ListenerEntry = {
  type: string;
  listener: EventListenerOrEventListenerObject;
  options?: boolean | AddEventListenerOptions;
};
let windowListeners: ListenerEntry[] = [];

const originalSetInterval = global.setInterval;
const originalClearInterval = global.clearInterval;
const originalSetTimeout = global.setTimeout;
const originalClearTimeout = global.clearTimeout;
const originalServerListen = Server.prototype.listen;
const originalServerClose = Server.prototype.close;
let originalAddEventListener: typeof window.addEventListener | undefined;
let originalRemoveEventListener: typeof window.removeEventListener | undefined;

beforeAll(() => {
  global.setInterval = ((handler: TimerHandler, timeout?: number, ...args: any[]) => {
    const id = originalSetInterval(handler, timeout, ...args);
    activeIntervals.add(id);
    return id;
  }) as typeof global.setInterval;

  global.clearInterval = ((id?: number | NodeJS.Timeout) => {
    if (id) {
      activeIntervals.delete(id as NodeJS.Timeout);
    }
    return originalClearInterval(id as any);
  }) as typeof global.clearInterval;

  global.setTimeout = ((handler: TimerHandler, timeout?: number, ...args: any[]) => {
    const id = originalSetTimeout(handler, timeout, ...args);
    activeTimeouts.add(id);
    return id;
  }) as typeof global.setTimeout;

  global.clearTimeout = ((id?: number | NodeJS.Timeout) => {
    if (id) {
      activeTimeouts.delete(id as NodeJS.Timeout);
    }
    return originalClearTimeout(id as any);
  }) as typeof global.clearTimeout;

  // Track Node servers opened during tests.
  Server.prototype.listen = function listenPatched(this: Server, ...args: any[]) {
    activeServers.add(this);
    return originalServerListen.apply(this, args as any);
  } as typeof Server.prototype.listen;

  Server.prototype.close = function closePatched(this: Server, ...args: any[]) {
    activeServers.delete(this);
    return originalServerClose.apply(this, args as any);
  } as typeof Server.prototype.close;

  if (typeof window !== 'undefined' && window.addEventListener) {
    originalAddEventListener = window.addEventListener.bind(window);
    originalRemoveEventListener = window.removeEventListener.bind(window);

    window.addEventListener = function patchedAdd(this: Window, type, listener, options) {
      windowListeners.push({ type, listener, options });
      return originalAddEventListener!(type, listener, options);
    } as typeof window.addEventListener;

    window.removeEventListener = function patchedRemove(this: Window, type, listener, options) {
      windowListeners = windowListeners.filter(
        (entry) => !(entry.type === type && entry.listener === listener && entry.options === options),
      );
      return originalRemoveEventListener!(type, listener, options);
    } as typeof window.removeEventListener;
  }
});

afterEach(async () => {
  cleanup();

  for (const id of Array.from(activeIntervals)) {
    originalClearInterval(id as any);
  }
  activeIntervals.clear();

  for (const id of Array.from(activeTimeouts)) {
    originalClearTimeout(id as any);
  }
  activeTimeouts.clear();

  if (typeof window !== 'undefined' && originalRemoveEventListener) {
    for (const entry of windowListeners) {
      try {
        originalRemoveEventListener(entry.type as any, entry.listener as any, entry.options as any);
      } catch {}
    }
    windowListeners = [];
  }

  if (activeServers.size > 0) {
    await Promise.all(
      Array.from(activeServers).map(
        (server) =>
          new Promise<void>((resolve) => {
            try {
              server.close((err) => {
                if (err) {
                  resolve();
                  return;
                }
                resolve();
              });
            } catch {
              resolve();
            }
          }),
      ),
    );
    activeServers.clear();
  }
});

afterAll(() => {
  global.setInterval = originalSetInterval;
  global.clearInterval = originalClearInterval;
  global.setTimeout = originalSetTimeout;
  global.clearTimeout = originalClearTimeout;
  Server.prototype.listen = originalServerListen;
  Server.prototype.close = originalServerClose;

  if (typeof window !== 'undefined' && originalAddEventListener && originalRemoveEventListener) {
    window.addEventListener = originalAddEventListener;
    window.removeEventListener = originalRemoveEventListener;
  }
});
