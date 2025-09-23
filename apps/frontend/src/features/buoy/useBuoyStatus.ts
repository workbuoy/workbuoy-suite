import { useSyncExternalStore } from "react";

export type BuoyStatusState = {
  isTyping: boolean;
};

const BUOY_STATUS_EVENT = "wb:buoy-status";

let state: BuoyStatusState = { isTyping: false };
const listeners = new Set<() => void>();

function emit() {
  listeners.forEach((listener) => listener());
  if (typeof window !== "undefined") {
    window.dispatchEvent(new CustomEvent(BUOY_STATUS_EVENT, { detail: state }));
  }
}

function subscribe(listener: () => void) {
  listeners.add(listener);
  return () => {
    listeners.delete(listener);
  };
}

export function setBuoyTyping(isTyping: boolean) {
  if (state.isTyping === isTyping) return;
  state = { isTyping };
  emit();
}

export function useBuoyStatus() {
  return useSyncExternalStore(subscribe, () => state, () => state);
}

export function getBuoyStatus(): BuoyStatusState {
  return state;
}

export const buoyStatusEvent = BUOY_STATUS_EVENT;
