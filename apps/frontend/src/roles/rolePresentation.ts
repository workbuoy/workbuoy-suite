export type RolePresentation = {
  id: string;
  title: string;
  tone: string;
  tagline: string;
  priorityHints: string[];
  policyChips: string[];
  suggestedEntities: Array<{ type: "contact" | "deal" | "task" | "invoice" | "note"; id: string; label: string }>;
  navigationOrder: string[];
};

const ROLE_LIBRARY: Record<string, RolePresentation> = {
  sales_manager: {
    id: "sales_manager",
    title: "Sales Manager",
    tone: "Confident guidance focusing on team momentum.",
    tagline: "Buoy AI keeps pipeline risk in focus so you can coach the team before quarter close.",
    priorityHints: [
      "Deals slipping 30+ days",
      "Top performers with stalled outreach",
      "Forecast delta vs. committed",
    ],
    policyChips: ["Requires approval before auto-execute", "Surfaces revenue guardrails"],
    suggestedEntities: [
      { type: "deal", id: "deal-4721", label: "Acme Expansion" },
      { type: "contact", id: "contact-301", label: "Helene Wiese" },
      { type: "task", id: "task-1099", label: "Coach Q4 pursuits" },
    ],
    navigationOrder: ["deal", "contact", "task", "note"],
  },
  sales_rep: {
    id: "sales_rep",
    title: "Account Executive",
    tone: "Energetic, action-oriented coaching.",
    tagline: "Buoy AI spotlights the next best touch so you can close faster without missing policy checks.",
    priorityHints: ["Hot leads waiting on replies", "Commitments due this week", "Renewals needing legal review"],
    policyChips: ["Auto-drafts emails, requires send confirmation", "Legal approval required for discounts"],
    suggestedEntities: [
      { type: "deal", id: "deal-4888", label: "Globex Upsell" },
      { type: "task", id: "task-2081", label: "Reply to Contoso" },
      { type: "contact", id: "contact-982", label: "Jonas Engel" },
    ],
    navigationOrder: ["task", "deal", "contact", "note"],
  },
  revenue_ops: {
    id: "revenue_ops",
    title: "Revenue Operations",
    tone: "Structured and audit-ready.",
    tagline: "Buoy AI highlights data integrity so the forecast stays defensible for leadership.",
    priorityHints: ["Deals missing products", "Opportunities without next step", "Automation overrides"],
    policyChips: ["All changes logged", "Requires approval for kraken mode"],
    suggestedEntities: [
      { type: "task", id: "task-3302", label: "Fix stage hygiene" },
      { type: "deal", id: "deal-5301", label: "Northwind New Logo" },
      { type: "invoice", id: "invoice-2201", label: "Q3 expansion invoice" },
    ],
    navigationOrder: ["task", "invoice", "deal", "contact"],
  },
  support_lead: {
    id: "support_lead",
    title: "Support Lead",
    tone: "Calm and empathetic with urgency for escalations.",
    tagline: "Buoy AI routes the urgent queues and reminds you which policies apply to each customer tier.",
    priorityHints: ["Escalations breaching SLA", "VIP cases pending triage", "Automation paused alerts"],
    policyChips: ["Automation limited to read-only", "Requires advisory review for kraken"],
    suggestedEntities: [
      { type: "task", id: "task-4401", label: "Audit backlog" },
      { type: "contact", id: "contact-222", label: "VIP: Marit Strand" },
      { type: "note", id: "note-esc", label: "Escalation policy" },
    ],
    navigationOrder: ["task", "contact", "note", "deal"],
  },
  analyst: {
    id: "analyst",
    title: "Revenue Analyst",
    tone: "Precise and data-led.",
    tagline: "Buoy AI preps the trendlines and context, leaving you to interpret what matters most.",
    priorityHints: ["Metrics anomalies", "Segments trending down", "Projections needing validation"],
    policyChips: ["Hands-off automation", "Proactivity limited to suggestions"],
    suggestedEntities: [
      { type: "note", id: "note-forecast", label: "Forecast diagnostics" },
      { type: "deal", id: "deal-2200", label: "Pipeline variance" },
      { type: "task", id: "task-555", label: "Review variance report" },
    ],
    navigationOrder: ["note", "deal", "task", "contact"],
  },
  developer: {
    id: "developer",
    title: "Platform Engineer",
    tone: "Pragmatic with focus on rollout safety.",
    tagline: "Buoy AI emphasises feature flags, telemetry, and rollout risk so changes ship safely.",
    priorityHints: ["Feature flags pending", "Rollout metrics", "Pager alerts acknowledged"],
    policyChips: ["Code merges require CLI", "Kraken blocked for engineering"],
    suggestedEntities: [
      { type: "task", id: "task-flag", label: "Toggle feature flag" },
      { type: "note", id: "note-runbook", label: "Runbook link" },
      { type: "contact", id: "contact-ops", label: "Release manager" },
    ],
    navigationOrder: ["task", "note", "contact", "deal"],
  },
};

const DEFAULT_PRESENTATION: RolePresentation = {
  id: "ops",
  title: "Operator",
  tone: "Steady and policy-forward.",
  tagline: "Buoy AI keeps operations aligned with approvals, surfacing nudges without overstepping.",
  priorityHints: ["Review handoffs", "Watch critical alerts", "Coordinate approvals"],
  policyChips: ["Requires explicit approval for automation"],
  suggestedEntities: [
    { type: "task", id: "task-default", label: "Operations checklist" },
    { type: "note", id: "note-guard", label: "Guardrails" },
  ],
  navigationOrder: ["task", "note", "contact", "deal"],
};

export function resolveRolePresentation(roleId: string): RolePresentation {
  return ROLE_LIBRARY[roleId] ?? DEFAULT_PRESENTATION;
}

export function listKnownRoles() {
  return Object.keys(ROLE_LIBRARY);
}
