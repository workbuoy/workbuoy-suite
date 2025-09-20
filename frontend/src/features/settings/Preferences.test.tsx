import { renderToStaticMarkup } from "react-dom/server";
import { describe, it, expect, beforeEach, afterAll, vi } from "vitest";

type MediaPrefs = {
  motion?: boolean;
  sound?: boolean;
};

const originalWindow = globalThis.window;
const originalLocalStorage = (globalThis as any).localStorage;

function createLocalStorage() {
  const store = new Map<string, string>();
  return {
    getItem(key: string) {
      return store.has(key) ? store.get(key)! : null;
    },
    setItem(key: string, value: string) {
      store.set(key, value);
    },
    removeItem(key: string) {
      store.delete(key);
    },
    clear() {
      store.clear();
    },
  } satisfies Storage;
}

function setupWindow(prefs: MediaPrefs = {}) {
  const listeners = new Map<string, Array<(event: MediaQueryListEvent) => void>>();
  const matchMedia = (query: string): MediaQueryList => {
    const matches =
      (prefs.motion && query.includes("prefers-reduced-motion")) ||
      (prefs.sound && (query.includes("prefers-reduced-sound") || query.includes("prefers-reduced-transparency"))) ||
      false;
    return {
      matches,
      media: query,
      onchange: null,
      addEventListener: (type: string, listener: (event: MediaQueryListEvent) => void) => {
        if (type !== "change") return;
        const arr = listeners.get(query) ?? [];
        arr.push(listener);
        listeners.set(query, arr);
      },
      removeEventListener: (type: string, listener: (event: MediaQueryListEvent) => void) => {
        if (type !== "change") return;
        const arr = listeners.get(query);
        if (!arr) return;
        listeners.set(
          query,
          arr.filter((fn) => fn !== listener),
        );
      },
      addListener: () => undefined,
      removeListener: () => undefined,
      dispatchEvent: () => false,
    } as MediaQueryList;
  };

  const localStorage = createLocalStorage();
  const location = {
    href: "https://demo.workbuoy.local/",
    search: "",
    hash: "",
    hostname: "demo.workbuoy.local",
    pathname: "/",
    assign: vi.fn(),
    reload: vi.fn(),
    replace: vi.fn(),
  } as unknown as Location;

  const history = {
    state: null,
    replaceState: vi.fn(),
    pushState: vi.fn(),
  } as unknown as History;

  (globalThis as any).localStorage = localStorage;
  (globalThis as any).window = {
    matchMedia,
    localStorage,
    location,
    history,
    addEventListener: vi.fn(),
    removeEventListener: vi.fn(),
  } as Window & typeof globalThis;
}

describe("Preferences", () => {
  beforeEach(() => {
    vi.resetModules();
  });

  afterAll(() => {
    if (originalWindow) {
      (globalThis as any).window = originalWindow;
    } else {
      delete (globalThis as any).window;
    }
    if (originalLocalStorage) {
      (globalThis as any).localStorage = originalLocalStorage;
    } else {
      delete (globalThis as any).localStorage;
    }
  });

  it("persists toggles to storage and rehydrates", async () => {
    setupWindow();
    const storeModule = await import("@/store/settings");
    storeModule.settingsStore.toggle("enableCollabPanel");
    expect(globalThis.localStorage.getItem("wb.settings")).toContain("\"enableCollabPanel\":true");

    storeModule.settingsStore.reset();
    const Preferences = (await import("./Preferences")).default;
    const markup = renderToStaticMarkup(<Preferences />);
    expect(markup).toMatch(/Teams &amp; Slack[\s\S]*aria-checked="true"/);
  });

  it("respects reduced motion and sound preferences", async () => {
    setupWindow({ motion: true, sound: true });
    const storeModule = await import("@/store/settings");
    storeModule.settingsStore.reset();
    const Preferences = (await import("./Preferences")).default;
    const markup = renderToStaticMarkup(<Preferences />);
    expect(markup).toMatch(/Redusert animasjon[\s\S]*aria-checked="true"[\s\S]*disabled/);
    expect(markup).toMatch(/Redusert lyd[\s\S]*aria-checked="true"[\s\S]*disabled/);
    expect(markup).toMatch(/Diskré lydhint[\s\S]*aria-checked="false"[\s\S]*disabled/);
  });
});
