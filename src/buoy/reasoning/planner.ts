/**
 * Buoy planner (MVP): choose an action based on intent.
 */
import type { BuoyContext } from "../memory/context";
import type { OpenApiPlan } from "../actions/openapiCall";

export type PlanResult = {
  action: string;
  rationale: string;
  confidence: number;
  alternatives?: string[];
  call?: OpenApiPlan;
};

type IntentParams = Record<string, any> | undefined;

type IntentMapping = {
  method: string;
  path: string | ((params: IntentParams) => string | null | undefined);
  rationale: string;
  confidence?: number;
  body?: (params: IntentParams) => unknown;
  headers?: (params: IntentParams) => Record<string, string> | undefined;
};

const intentMap: Record<string, IntentMapping> = {
  "crm.contacts.list": { method: "GET", path: "/api/v1/crm/contacts", rationale: "List CRM contacts", confidence: 0.7 },
  "crm.contacts.create": { method: "POST", path: "/api/v1/crm/contacts", rationale: "Create CRM contact", confidence: 0.75 },
  "crm.contacts.update": {
    method: "PATCH",
    path: (params) => buildIdPath(params, "/api/v1/crm/contacts"),
    rationale: "Update CRM contact",
    confidence: 0.68,
  },
  "crm.contacts.delete": {
    method: "DELETE",
    path: (params) => buildIdPath(params, "/api/v1/crm/contacts"),
    rationale: "Delete CRM contact",
    confidence: 0.65,
  },
  "crm.opportunities.list": { method: "GET", path: "/api/v1/crm/opportunities", rationale: "List CRM opportunities", confidence: 0.7 },
  "crm.opportunities.create": { method: "POST", path: "/api/v1/crm/opportunities", rationale: "Create CRM opportunity", confidence: 0.75 },
  "crm.opportunities.update": {
    method: "PATCH",
    path: (params) => buildIdPath(params, "/api/v1/crm/opportunities"),
    rationale: "Update CRM opportunity",
    confidence: 0.7,
  },
  "crm.opportunities.delete": {
    method: "DELETE",
    path: (params) => buildIdPath(params, "/api/v1/crm/opportunities"),
    rationale: "Delete CRM opportunity",
    confidence: 0.65,
  },
  "crm.pipelines.list": { method: "GET", path: "/api/v1/crm/pipelines", rationale: "List CRM pipelines", confidence: 0.7 },
  "geo.geocode": {
    method: "POST",
    path: "/api/v1/geo/geocode",
    rationale: "Geocode addresses",
    confidence: 0.72,
    body: (params) => buildGeocodeBody(params),
  },
  "geo.territory.assign": {
    method: "POST",
    path: "/api/v1/geo/territory/assign",
    rationale: "Assign territory based on polygon coverage",
    confidence: 0.7,
  },
};

function buildIdPath(params: IntentParams, base: string): string | null {
  if (!params) return null;
  const id = params.id || params.contactId || params.opportunityId || params.recordId || params?.target?.id;
  if (!id) return null;
  return `${base}/${id}`;
}

function buildGeocodeBody(params: IntentParams): { addresses: string[] } {
  if (Array.isArray(params?.addresses)) {
    return { addresses: params!.addresses.map(String) };
  }
  if (Array.isArray(params)) {
    return { addresses: params.map(String) } as { addresses: string[] };
  }
  if (typeof params?.address === "string") {
    return { addresses: [params.address] };
  }
  return { addresses: [] };
}

function normaliseIntent(intent: string): string {
  return intent?.toLowerCase?.() ?? "";
}

function resolveMappedPlan(intent: string, params: IntentParams): PlanResult | null {
  const entry = intentMap[normaliseIntent(intent)];
  if (!entry) return null;
  const path = typeof entry.path === "function" ? entry.path(params) : entry.path;
  if (!path) return null;
  const body = entry.body ? entry.body(params) : params;
  const headers = entry.headers ? entry.headers(params) : undefined;
  return {
    action: "openapi.call",
    rationale: entry.rationale,
    confidence: entry.confidence ?? 0.7,
    call: { method: entry.method, path, body, headers },
  };
}

function resolveDirectPlan(params: IntentParams): PlanResult | null {
  if (!params) return null;
  const method = typeof params.method === "string"
    ? params.method
    : typeof params.httpMethod === "string"
      ? params.httpMethod
      : undefined;
  const path = typeof params.path === "string"
    ? params.path
    : typeof params.url === "string"
      ? params.url
      : undefined;
  if (!method || !path) return null;
  const rationale = typeof params.rationale === "string" ? params.rationale : `Execute ${method.toUpperCase()} ${path}`;
  const body = params.body !== undefined
    ? params.body
    : params.payload !== undefined
      ? params.payload
      : params;
  const headers = typeof params.headers === "object" && params.headers !== null
    ? (params.headers as Record<string, string>)
    : undefined;
  const confidence = typeof params.confidence === "number" ? params.confidence : 0.65;
  return {
    action: "openapi.call",
    rationale,
    confidence,
    call: { method, path, body, headers },
  };
}

export async function plan(intent: string, ctx: BuoyContext, params?: IntentParams): Promise<PlanResult> {
  void ctx; // context currently unused but reserved for richer planning.
  const direct = resolveDirectPlan(params);
  if (direct) {
    return direct;
  }

  const mapped = resolveMappedPlan(intent, params);
  if (mapped) {
    return mapped;
  }

  if (!intent) {
    return {
      action: "noop",
      rationale: "No intent provided; default to noop",
      confidence: 0.3,
      alternatives: [],
    };
  }
  if (intent === "echo") {
    return {
      action: "noop",
      rationale: "Echo intent → noop with echo payload (verifiable path)",
      confidence: 0.7,
      alternatives: ["noop"],
    };
  }
  return {
    action: "noop",
    rationale: `Unknown intent '${intent}' → noop`,
    confidence: 0.4,
    alternatives: ["noop"],
  };
}
