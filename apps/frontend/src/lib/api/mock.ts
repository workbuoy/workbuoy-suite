const addons = [
  { id: "crm", name: "Kontakter", icon: "👥", category: "CRM", enabled: true, description: "Kunder og kontakter" },
  { id: "mail", name: "E-post", icon: "✉️", category: "Kommunikasjon", enabled: true, description: "Send og motta e-post" },
  { id: "erp", name: "Faktura", icon: "📄", category: "ERP", enabled: false, description: "Fakturering og regnskap", connectUrl: "/connect/erp" },
  { id: "files", name: "Dokumenter", icon: "📁", category: "Innhold", enabled: true, description: "Filer og deling" },
];

let contacts = [
  { id: "1", name: "Ola Nordmann", email: "ola@example.com", phone: "+47 99887766", crmId: "HS-1001", system: "hubspot" },
  { id: "2", name: "Kari Normann", email: "kari@example.com", phone: "+47 90112233", crmId: "HS-1002", system: "hubspot" },
];

const delay = (ms: number) => new Promise((res) => setTimeout(res, ms));

const PROACTIVITY_META = {
  usynlig: { id: 1, banner: "Observing silently", reviewType: "none", requiresApproval: false },
  rolig: { id: 2, banner: "Monitoring in read-only mode", reviewType: "passive", requiresApproval: false },
  proaktiv: { id: 3, banner: "Suggestions ready", reviewType: "suggestion", requiresApproval: false },
  ambisiøs: { id: 4, banner: "Previews prepared", reviewType: "approval", requiresApproval: true },
  kraken: { id: 5, banner: "Executing with guardrails", reviewType: "execution", requiresApproval: true },
  tsunami: { id: 6, banner: "Hands-free automation engaged", reviewType: "execution", requiresApproval: true },
} as const;

type ModeKey = keyof typeof PROACTIVITY_META;

type ProactivityState = {
  tenantId: string;
  requested: number;
  requestedKey: ModeKey;
  effective: number;
  effectiveKey: ModeKey;
  basis: string[];
  caps: Record<string, unknown>;
  degradeRail: ModeKey[];
  uiHints: {
    banner: string;
    reviewType: string;
    callToAction: string;
    overlay: boolean;
    healthChecks: boolean;
  };
  subscription: { plan: string };
  featureId: string;
  timestamp: string;
};

function buildProactivityState(mode: ModeKey, opts: { approved?: boolean; reason?: string } = {}): ProactivityState {
  const meta = PROACTIVITY_META[mode] ?? PROACTIVITY_META.proaktiv;
  const approved = opts.approved ?? false;
  const effectiveKey: ModeKey = meta.requiresApproval && !approved ? "proaktiv" : mode;
  const effectiveMeta = PROACTIVITY_META[effectiveKey];
  const basis = meta.requiresApproval && !approved ? ["policy:requires_approval"] : ["policy:approved"];
  if (opts.reason) basis.push(`reason:${opts.reason}`);

  return {
    tenantId: "demo-tenant",
    requested: meta.id,
    requestedKey: mode,
    effective: effectiveMeta.id,
    effectiveKey,
    basis,
    caps: { automation: effectiveMeta.id >= PROACTIVITY_META.kraken.id ? "elevated" : "assistive" },
    degradeRail: ["tsunami", "kraken", "ambisiøs", "proaktiv", "rolig", "usynlig"],
    uiHints: {
      banner: effectiveMeta.banner,
      reviewType: effectiveMeta.reviewType,
      callToAction: effectiveMeta.requiresApproval ? "Review & approve" : "See suggestions",
      overlay: effectiveMeta.id >= PROACTIVITY_META.tsunami.id,
      healthChecks: effectiveMeta.id >= PROACTIVITY_META.kraken.id,
    },
    subscription: { plan: "enterprise" },
    featureId: "global",
    timestamp: new Date().toISOString(),
  };
}

let proactivityState = buildProactivityState("proaktiv");

if (typeof window !== "undefined") {
  const ctx = (window as any).__WB_CONTEXT__ || ((window as any).__WB_CONTEXT__ = {});
  if (!ctx.roleId) {
    ctx.roleId = "sales_manager";
    ctx.role = "sales_manager";
    ctx.roleDisplayName = "Sales Manager";
  }
  ctx.autonomyLevel = proactivityState.effective;
}

const originalFetch = window.fetch.bind(window);
window.fetch = async (input: RequestInfo | URL, init?: RequestInit) => {
  const url = typeof input === "string" ? input : input.toString();
  const method = (init?.method || "GET").toUpperCase();

  if (url.endsWith("/api/health")) {
    await delay(120);
    return new Response(JSON.stringify({ ok: true, service: "core" }), { status: 200 });
  }

  if (url.endsWith("/api/addons") && method === "GET") {
    await delay(120);
    return new Response(JSON.stringify(addons), {
      status: 200,
      headers: { "Content-Type": "application/json" },
    });
  }

  if (url.endsWith("/api/crm/contacts") && method === "GET") {
    await delay(140);
    return new Response(JSON.stringify(contacts), {
      status: 200,
      headers: { "Content-Type": "application/json" },
    });
  }

  if (url.endsWith("/api/crm/contacts") && method === "POST") {
    await delay(160);
    try {
      const bodyText = typeof (init as any).body === "string" ? (init as any).body : "";
      const payload = bodyText ? JSON.parse(bodyText) : {};
      const id = String(Date.now());
      const crmId = "HS-" + id.slice(-4);
      const item = { id, system: "hubspot", crmId, ...payload };
      contacts = [item, ...contacts];
      return new Response(JSON.stringify(item), {
        status: 201,
        headers: { "Content-Type": "application/json" },
      });
    } catch {
      return new Response(JSON.stringify({ error: "Bad JSON" }), { status: 400 });
    }
  }

  if (url.endsWith("/api/proactivity/state") && method === "GET") {
    await delay(80);
    return new Response(JSON.stringify(proactivityState), {
      status: 200,
      headers: { "Content-Type": "application/json" },
    });
  }

  if (url.endsWith("/api/proactivity/state") && method === "POST") {
    await delay(120);
    try {
      const bodyText = typeof (init as any).body === "string" ? (init as any).body : "";
      const payload = bodyText ? JSON.parse(bodyText) : {};
      const requested = ((payload.requested || payload.requestedMode || payload.mode) ?? "proaktiv").toLowerCase() as ModeKey;
      proactivityState = buildProactivityState(requested, { approved: payload.approved, reason: payload.reason });
      if (typeof window !== "undefined") {
        const ctx = (window as any).__WB_CONTEXT__ || ((window as any).__WB_CONTEXT__ = {});
        ctx.autonomyLevel = proactivityState.effective;
      }
      return new Response(JSON.stringify(proactivityState), {
        status: 200,
        headers: { "Content-Type": "application/json" },
      });
    } catch {
      return new Response(JSON.stringify({ error: "parse_error" }), { status: 400 });
    }
  }

  if (url.endsWith("/core/actions/commit") && method === "POST") {
    await delay(180);
    try {
      const bodyText = typeof (init as any).body === "string" ? (init as any).body : "";
      const { proposal } = bodyText ? JSON.parse(bodyText) : { proposal: null };
      const link =
        proposal?.entity === "contact"
          ? `https://app.hubspot.com/contacts/${proposal?.entityId || "new"}`
          : "https://app.example.com";
      return new Response(
        JSON.stringify({ ok: true, externalId: proposal?.entityId || "new", version: "v1", link }),
        {
          status: 200,
          headers: { "Content-Type": "application/json" },
        },
      );
    } catch {
      return new Response(JSON.stringify({ ok: false, errors: ["parse-error"] }), { status: 500 });
    }
  }

  if (url.endsWith("/genetics/implement-evolution")) {
    await delay(90);
    return new Response(
      JSON.stringify({
        ok: false,
        error: "approval_required",
        message: "Manual approval required. Place operator sign-off at .evolution/APPROVED.",
      }),
      { status: 403, headers: { "Content-Type": "application/json" } },
    );
  }

  return originalFetch(input, init);
};
