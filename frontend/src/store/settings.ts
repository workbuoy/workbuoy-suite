import { useSyncExternalStore } from "react";
import { Flags } from "@/lib/flags";
import { prefersReducedAudio } from "@/features/peripheral/AudioCue";

type SettingsKey =
  | "audioCues"
  | "enableO365Panel"
  | "enableCollabPanel"
  | "enableGwsPanel"
  | "enableVismaPanel"
  | "reducedMotion"
  | "reducedSound";

export type { SettingsKey };

export type SettingsState = {
  audioCues: boolean;
  enableO365Panel: boolean;
  enableCollabPanel: boolean;
  enableGwsPanel: boolean;
  enableVismaPanel: boolean;
  reducedMotion: boolean;
  reducedSound: boolean;
  systemReducedMotion: boolean;
  systemReducedSound: boolean;
};

const STORAGE_KEY = "wb.settings";
const MOTION_QUERY = "(prefers-reduced-motion: reduce)";
const SOUND_QUERIES = [
  "(prefers-reduced-sound: reduce)",
  "(prefers-reduced-transparency: reduce)",
  "(prefers-reduced-motion: reduce)",
];

const PERSISTED_KEYS: SettingsKey[] = [
  "audioCues",
  "enableO365Panel",
  "enableCollabPanel",
  "enableGwsPanel",
  "enableVismaPanel",
  "reducedMotion",
  "reducedSound",
];

type PersistedRecord = Record<SettingsKey, boolean>;

const listeners = new Set<() => void>();

function emit() {
  listeners.forEach((listener) => listener());
}

function subscribe(listener: () => void) {
  listeners.add(listener);
  return () => {
    listeners.delete(listener);
  };
}

function getMediaQueryMatch(query: string): boolean {
  if (typeof window === "undefined" || typeof window.matchMedia !== "function") {
    return false;
  }
  try {
    return window.matchMedia(query).matches;
  } catch {
    return false;
  }
}

function readFromStorage(): Partial<PersistedRecord> {
  if (typeof window === "undefined") return {};
  try {
    const raw = window.localStorage.getItem(STORAGE_KEY);
    if (!raw) return {};
    const parsed = JSON.parse(raw) as Partial<Record<string, unknown>>;
    const next: Partial<PersistedRecord> = {};
    for (const key of PERSISTED_KEYS) {
      const value = parsed[key];
      if (typeof value === "boolean") {
        next[key] = value;
      }
    }
    return next;
  } catch {
    return {};
  }
}

function writeToStorage(state: SettingsState) {
  if (typeof window === "undefined") return;
  const payload: Partial<PersistedRecord> = {};
  for (const key of PERSISTED_KEYS) {
    payload[key] = state[key];
  }
  try {
    window.localStorage.setItem(STORAGE_KEY, JSON.stringify(payload));
  } catch {
    /* ignore persistence failures */
  }
}

function baseState(): SettingsState {
  return {
    audioCues: true,
    enableO365Panel: Flags.enableO365Panel,
    enableCollabPanel: Flags.enableCollabPanel,
    enableGwsPanel: Flags.enableGwsPanel,
    enableVismaPanel: Flags.enableVismaPanel,
    reducedMotion: false,
    reducedSound: false,
    systemReducedMotion: false,
    systemReducedSound: false,
  };
}

function applyGuards(next: SettingsState): SettingsState {
  const guarded: SettingsState = { ...next };
  if (guarded.systemReducedMotion) {
    guarded.reducedMotion = true;
  }
  if (guarded.systemReducedSound) {
    guarded.reducedSound = true;
  }
  if (guarded.reducedSound) {
    guarded.audioCues = false;
  }
  return guarded;
}

function computeInitialState(): SettingsState {
  const persisted = readFromStorage();
  const base = baseState();
  const systemReducedMotion = getMediaQueryMatch(MOTION_QUERY);
  const systemReducedSound = prefersReducedAudio();

  const initial: SettingsState = applyGuards({
    ...base,
    ...persisted,
    reducedMotion: systemReducedMotion ? true : persisted.reducedMotion ?? base.reducedMotion,
    reducedSound: systemReducedSound ? true : persisted.reducedSound ?? base.reducedSound,
    systemReducedMotion,
    systemReducedSound,
  });

  if (systemReducedSound) {
    initial.audioCues = false;
  } else if (typeof persisted.audioCues === "boolean") {
    initial.audioCues = persisted.audioCues;
  } else {
    initial.audioCues = true;
  }

  return applyGuards(initial);
}

let state: SettingsState = computeInitialState();

function hasChanged(prev: SettingsState, next: SettingsState): boolean {
  const keys = Object.keys(prev) as (keyof SettingsState)[];
  for (const key of keys) {
    if (prev[key] !== next[key]) return true;
  }
  return false;
}

type StateUpdater = Partial<SettingsState> | ((prev: SettingsState) => Partial<SettingsState>);

function updateState(updater: StateUpdater) {
  const partial = typeof updater === "function" ? updater(state) : updater;
  const next = applyGuards({ ...state, ...partial });
  if (!hasChanged(state, next)) return;
  state = next;
  writeToStorage(state);
  emit();
}

function getState(): SettingsState {
  return state;
}

function toggleSetting(key: SettingsKey) {
  updateState((prev) => ({ [key]: !prev[key] } as Partial<SettingsState>));
}

function setSetting(key: SettingsKey, value: boolean) {
  updateState({ [key]: value } as Partial<SettingsState>);
}

function syncSystemMotion(matches?: boolean) {
  const resolved = typeof matches === "boolean" ? matches : getMediaQueryMatch(MOTION_QUERY);
  updateState((prev) => ({
    systemReducedMotion: resolved,
    reducedMotion: resolved ? true : prev.reducedMotion,
  }));
}

function syncSystemSound() {
  const resolved = prefersReducedAudio();
  updateState((prev) => ({
    systemReducedSound: resolved,
    reducedSound: resolved ? true : prev.reducedSound,
  }));
}

function setupMediaListeners() {
  if (typeof window === "undefined" || typeof window.matchMedia !== "function") {
    return;
  }
  try {
    const motionMedia = window.matchMedia(MOTION_QUERY);
    const handleMotion = (event: MediaQueryListEvent) => syncSystemMotion(event.matches);
    if (motionMedia.addEventListener) {
      motionMedia.addEventListener("change", handleMotion);
    } else if (typeof motionMedia.addListener === "function") {
      motionMedia.addListener(handleMotion);
    }
    SOUND_QUERIES.forEach((query) => {
      try {
        const media = window.matchMedia(query);
        const handle = () => syncSystemSound();
        if (media.addEventListener) {
          media.addEventListener("change", handle);
        } else if (typeof media.addListener === "function") {
          media.addListener(handle);
        }
      } catch {
        /* ignore unsupported media query */
      }
    });
  } catch {
    /* ignore listener setup failures */
  }
}

if (typeof window !== "undefined") {
  setupMediaListeners();
}

export function useSettings<T>(selector: (state: SettingsState) => T): T {
  return useSyncExternalStore(subscribe, () => selector(state), () => selector(state));
}

export const settingsStore = {
  getState,
  subscribe,
  setState: updateState,
  set: setSetting,
  toggle: toggleSetting,
  reset() {
    state = computeInitialState();
    emit();
  },
};

export { setSetting, toggleSetting, getState as getSettingsState };
