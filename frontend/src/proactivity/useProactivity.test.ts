import React from "react";
import { vi, beforeEach, afterEach, describe, expect, test } from "vitest";
import { render, waitFor } from "@testing-library/react";
import { useProactivity, type UseProactivityReturn } from "./useProactivity";

describe("useProactivity", () => {
  const baseState = {
    tenantId: "demo",
    requested: 3,
    requestedKey: "proaktiv",
    effective: 3,
    effectiveKey: "proaktiv",
    basis: ["policy:approved"],
    caps: {},
    degradeRail: ["tsunami", "kraken", "ambisiøs", "proaktiv", "rolig", "usynlig"],
    uiHints: {
      banner: "Suggestions ready",
      reviewType: "suggestion",
      callToAction: "See suggestions",
      overlay: false,
      healthChecks: false,
    },
    subscription: { plan: "demo" },
    featureId: "global",
    timestamp: new Date().toISOString(),
  } as const;

  let state = { ...baseState };

  beforeEach(() => {
    state = { ...baseState };
    vi.stubGlobal("fetch", vi.fn(async (input: RequestInfo | URL, init?: RequestInit) => {
      const url = typeof input === "string" ? input : input.toString();
      const method = (init?.method || "GET").toUpperCase();
      if (url.endsWith("/api/proactivity/state") && method === "GET") {
        return new Response(JSON.stringify(state), {
          status: 200,
          headers: { "Content-Type": "application/json" },
        });
      }
      if (url.endsWith("/api/proactivity/state") && method === "POST") {
        const bodyText = typeof init?.body === "string" ? init.body : "";
        const payload = bodyText ? JSON.parse(bodyText) : {};
        const requestedKey = (payload.requested || payload.mode || "proaktiv").toLowerCase();
        const approved = Boolean(payload.approved);
        const effectiveKey = approved ? requestedKey : "proaktiv";
        state = {
          ...state,
          requestedKey,
          requested: requestedKey === "kraken" ? 5 : requestedKey === "ambisiøs" ? 4 : 3,
          effectiveKey,
          effective: effectiveKey === "kraken" ? 5 : effectiveKey === "ambisiøs" ? 4 : 3,
          basis: approved ? ["policy:approved"] : ["policy:requires_approval"],
        } as typeof state;
        return new Response(JSON.stringify(state), {
          status: 200,
          headers: { "Content-Type": "application/json" },
        });
      }
      return new Response("not-found", { status: 404 });
    }));
  });

  afterEach(() => {
    vi.unstubAllGlobals();
  });

  function Harness({ onChange }: { onChange: (value: UseProactivityReturn) => void }) {
    const proactivity = useProactivity();
    React.useEffect(() => {
      onChange(proactivity);
    }, [proactivity, onChange]);
    return null;
  }

  test("fetches state and honours approval flow", async () => {
    let latest: UseProactivityReturn | null = null;
    const handleChange = (value: UseProactivityReturn) => {
      latest = value;
    };
    render(<Harness onChange={handleChange} />);

    await waitFor(() => {
      expect(latest?.state?.requestedKey).toBe("proaktiv");
    });

    await latest!.setMode("kraken");
    await waitFor(() => {
      expect(latest?.state?.effectiveKey).toBe("proaktiv");
    });

    await latest!.setMode("kraken", { approved: true, reason: "pilot" });
    await waitFor(() => {
      expect(latest?.state?.effectiveKey).toBe("kraken");
      expect(latest?.state?.basis).toContain("policy:approved");
    });
  });
});
