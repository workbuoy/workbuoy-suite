import { describe, expect, it, beforeEach } from "vitest";
import { demoStore, publishDemoEvent, subscribeDemoEvents } from "./useDemoMode";
import { settingsStore } from "@/store/settings";

describe("demo store", () => {
  beforeEach(() => {
    settingsStore.reset();
    demoStore.stop();
  });

  it("activates integration flags when started", () => {
    demoStore.start();
    const state = settingsStore.getState();
    expect(demoStore.active).toBe(true);
    expect(state.enableCollabPanel).toBe(true);
    expect(state.enableGwsPanel).toBe(true);
    expect(state.enableVismaPanel).toBe(true);
  });

  it("notifies subscribers when events are published", () => {
    const events: Array<{ type: string }> = [];
    const unsubscribe = subscribeDemoEvents((event) => {
      events.push(event);
    });

    publishDemoEvent({ type: "contact-created", contact: { id: "c1", name: "Ada" } as any });
    publishDemoEvent({ type: "deal-created", deal: { id: "d1", contactId: "c1" } as any });
    publishDemoEvent({ type: "undo", entity: "contact", id: "c1" });

    unsubscribe();
    publishDemoEvent({ type: "undo", entity: "deal", id: "d1" });

    expect(events).toHaveLength(3);
    expect(events[0].type).toBe("contact-created");
    expect(events[1].type).toBe("deal-created");
    expect(events[2].type).toBe("undo");
  });
});
