import { useCallback, useEffect, useState } from "react";

export type ProactivityModeKey = "usynlig" | "rolig" | "proaktiv" | "ambisiøs" | "kraken" | "tsunami";

export const PROACTIVITY_ORDER: ProactivityModeKey[] = [
  "usynlig",
  "rolig",
  "proaktiv",
  "ambisiøs",
  "kraken",
  "tsunami",
];

export type ProactivityState = {
  tenantId: string;
  requested: number;
  requestedKey: ProactivityModeKey;
  effective: number;
  effectiveKey: ProactivityModeKey;
  basis: string[];
  caps?: Record<string, unknown>;
  degradeRail?: ProactivityModeKey[];
  uiHints?: {
    overlay?: boolean;
    callToAction?: string;
    banner?: string;
    healthChecks?: boolean;
    reviewType?: "none" | "passive" | "suggestion" | "approval" | "execution";
  };
  subscription?: unknown;
  featureId?: string;
  timestamp?: string;
};

export type ModeMeta = {
  key: ProactivityModeKey;
  label: string;
  description: string;
  requiresApproval: boolean;
  reviewType: ProactivityState["uiHints"] extends infer H
    ? H extends { reviewType?: infer R }
      ? R
      : ProactivityState["uiHints"]["reviewType"]
    : ProactivityState["uiHints"]["reviewType"];
  badge: string;
};

export const MODE_META: Record<ProactivityModeKey, ModeMeta> = {
  usynlig: {
    key: "usynlig",
    label: "Usynlig",
    description: "Silent observation. No UI prompts or actions.",
    requiresApproval: false,
    reviewType: "none",
    badge: "Silent",
  },
  rolig: {
    key: "rolig",
    label: "Rolig",
    description: "Read-only telemetry summaries.",
    requiresApproval: false,
    reviewType: "passive",
    badge: "Monitoring",
  },
  proaktiv: {
    key: "proaktiv",
    label: "Proaktiv",
    description: "Suggestions with lightweight call-to-action buttons.",
    requiresApproval: false,
    reviewType: "suggestion",
    badge: "Assistive",
  },
  ambisiøs: {
    key: "ambisiøs",
    label: "Ambisiøs",
    description: "Prepares previews and requires explicit approval to run.",
    requiresApproval: true,
    reviewType: "approval",
    badge: "Approval",
  },
  kraken: {
    key: "kraken",
    label: "Kraken",
    description: "Executes automations under guardrails; health checks required.",
    requiresApproval: true,
    reviewType: "execution",
    badge: "Execution",
  },
  tsunami: {
    key: "tsunami",
    label: "Tsunami",
    description: "Hands-free overlay with continuous health verification.",
    requiresApproval: true,
    reviewType: "execution",
    badge: "Automation",
  },
};

export type UseProactivityReturn = {
  state: ProactivityState | null;
  loading: boolean;
  error: string | null;
  mode: ProactivityModeKey;
  effectiveMode: ProactivityModeKey;
  setMode: (mode: ProactivityModeKey, opts?: { approved?: boolean; reason?: string }) => Promise<void>;
  refresh: () => Promise<void>;
  lastGuard?: string | null;
};

let cachedState: ProactivityState | null = null;
let cachedGuard: string | null = null;

async function fetchState(method: "GET" | "POST", body?: unknown): Promise<ProactivityState> {
  const init: RequestInit = { method };
  if (body) {
    init.body = JSON.stringify(body);
    init.headers = { "Content-Type": "application/json" };
  }
  const res = await fetch("/api/proactivity/state", init);
  if (!res.ok) {
    const text = await res.text();
    throw new Error(`proactivity ${method} ${res.status}: ${text}`);
  }
  const json = (await res.json()) as ProactivityState;
  cachedState = json;
  return json;
}

function emitTelemetry(mode: ProactivityModeKey, payload: { approved?: boolean; reason?: string }) {
  const globalLogger = (window as any)?.__WB_TELEMETRY__;
  if (typeof globalLogger?.track === "function") {
    globalLogger.track("proactivity_mode_change", { mode, ...payload });
  } else {
    console.info("[telemetry] proactivity_mode_change", { mode, ...payload });
  }
}

function deriveGuard(state: ProactivityState | null): string | null {
  if (!state) return null;
  if (state.degradeRail && state.degradeRail.length > 0) {
    return `Degrade rail: ${state.degradeRail.join(" → ")}`;
  }
  if (state.uiHints?.banner) return state.uiHints.banner;
  return null;
}

export function useProactivity(): UseProactivityReturn {
  const [state, setState] = useState<ProactivityState | null>(() => cachedState);
  const [loading, setLoading] = useState(!cachedState);
  const [error, setError] = useState<string | null>(null);
  const [lastGuard, setLastGuard] = useState<string | null>(() => cachedGuard);

  const refresh = useCallback(async () => {
    setLoading(true);
    try {
      const next = await fetchState("GET");
      setState(next);
      const guard = deriveGuard(next);
      cachedGuard = guard;
      setLastGuard(guard);
      setError(null);
      if (typeof window !== "undefined") {
        const ctx = (window as any).__WB_CONTEXT__ || ((window as any).__WB_CONTEXT__ = {});
        ctx.autonomyLevel = next.effective;
      }
    } catch (err: any) {
      setError(err?.message || String(err));
    } finally {
      setLoading(false);
    }
  }, []);

  useEffect(() => {
    if (!state) {
      void refresh();
    }
  }, [state, refresh]);

  const setMode = useCallback(
    async (mode: ProactivityModeKey, opts: { approved?: boolean; reason?: string } = {}) => {
      setLoading(true);
      try {
        const payload = { requested: mode, approved: opts.approved ?? false, reason: opts.reason };
        const next = await fetchState("POST", payload);
        setState(next);
        const guard = deriveGuard(next);
        cachedGuard = guard;
        setLastGuard(guard);
        setError(null);
        emitTelemetry(mode, opts);
      } catch (err: any) {
        setError(err?.message || String(err));
      } finally {
        setLoading(false);
      }
    },
    [],
  );

  const mode = state?.requestedKey ?? cachedState?.requestedKey ?? "proaktiv";
  const effectiveMode = state?.effectiveKey ?? cachedState?.effectiveKey ?? "proaktiv";

  return {
    state,
    loading,
    error,
    mode,
    effectiveMode,
    setMode,
    refresh,
    lastGuard,
  };
}
