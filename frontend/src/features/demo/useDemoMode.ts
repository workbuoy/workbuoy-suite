import { useEffect, useSyncExternalStore } from "react";
import { settingsStore } from "@/store/settings";
import type { DemoContact, DemoDeal } from "./data";

export type DemoEvent =
  | { type: "contact-created"; contact: DemoContact }
  | { type: "deal-created"; deal: DemoDeal }
  | { type: "undo"; entity: "contact" | "deal"; id: string };

const listeners = new Set<() => void>();
const eventListeners = new Set<(event: DemoEvent) => void>();

let active = resolveInitialState();

function resolveInitialState(): boolean {
  if (typeof window === "undefined") return false;
  const params = new URLSearchParams(window.location.search);
  return params.get("demo") === "1";
}

function syncQueryParam(value: boolean) {
  if (typeof window === "undefined") return;
  const url = new URL(window.location.href);
  if (value) {
    url.searchParams.set("demo", "1");
  } else {
    url.searchParams.delete("demo");
  }
  window.history.replaceState(window.history.state, "", url.toString());
}

function emit() {
  listeners.forEach((listener) => listener());
}

function notifyDemoEvent(event: DemoEvent) {
  eventListeners.forEach((listener) => listener(event));
}

function setActive(next: boolean) {
  if (active === next) return;
  active = next;
  syncQueryParam(next);
  if (next) {
    settingsStore.set("enableO365Panel", true);
    settingsStore.set("enableCollabPanel", true);
    settingsStore.set("enableGwsPanel", true);
    settingsStore.set("enableVismaPanel", true);
  }
  emit();
}

if (typeof window !== "undefined") {
  window.addEventListener("popstate", () => {
    const current = resolveInitialState();
    setActive(current);
  });
}

export function useDemoMode(): { active: boolean; start: () => void; stop: () => void; toggle: () => void } {
  const activeState = useSyncExternalStore(
    (listener) => {
      listeners.add(listener);
      return () => listeners.delete(listener);
    },
    () => active,
    () => active,
  );

  useEffect(() => {
    if (typeof window === "undefined") return;
    if (!activeState && resolveInitialState()) {
      setActive(true);
    }
  }, [activeState]);

  return {
    active: activeState,
    start: () => setActive(true),
    stop: () => setActive(false),
    toggle: () => setActive(!active),
  };
}

export function publishDemoEvent(event: DemoEvent) {
  notifyDemoEvent(event);
}

export function subscribeDemoEvents(handler: (event: DemoEvent) => void) {
  eventListeners.add(handler);
  return () => {
    eventListeners.delete(handler);
  };
}

export function useDemoEvents(handler: (event: DemoEvent) => void) {
  useEffect(() => subscribeDemoEvents(handler), [handler]);
}

export const demoStore = {
  get active() {
    return active;
  },
  start: () => setActive(true),
  stop: () => setActive(false),
  toggle: () => setActive(!active),
};
