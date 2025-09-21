export type DemoContact = {
  id: string;
  name: string;
  email?: string;
  phone?: string;
  createdAt?: string;
};

export type DemoDeal = {
  id: string;
  contactId: string;
  value: number;
  status: "open" | "won" | "lost";
  updatedAt?: string;
};

export type DemoThread = {
  id: string;
  channel: string;
  snippet: string;
  participants: string[];
  updatedAt: string;
  platform: "Slack" | "Teams";
};

export type DemoWorkspaceEntry = {
  id: string;
  title: string;
  kind: "doc" | "sheet" | "slide" | "mail";
  updatedAt: string;
  owner: string;
};

export type DemoKPI = {
  id: string;
  label: string;
  value: number;
  target: number;
  unit: string;
  trend: "up" | "down" | "flat";
};

export type DemoBreakdown = {
  id: string;
  label: string;
  value: number;
};

export type DemoVismaData = {
  kpis: DemoKPI[];
  collections: {
    cost: DemoBreakdown[];
    time: DemoBreakdown[];
    reminders: DemoBreakdown[];
  };
};

export const demoContacts: DemoContact[] = [
  { id: "98310", name: "Linn Borgen", email: "linn@fjordtek.no", phone: "+47 902 44 552", createdAt: "2025-09-17T09:18:00Z" },
  { id: "98311", name: "Anders Strøm", email: "anders@aqualine.no", phone: "+47 988 44 123", createdAt: "2025-09-16T12:45:00Z" },
  { id: "98312", name: "Sofie Kaspersen", email: "sofie@cloudly.ai", phone: "+47 930 88 210", createdAt: "2025-09-14T14:02:00Z" },
];

export const demoDeals: DemoDeal[] = [
  { id: "DEMO-101", contactId: "98310", value: 420000, status: "open", updatedAt: "2025-09-17T10:04:00Z" },
  { id: "DEMO-090", contactId: "98311", value: 198000, status: "won", updatedAt: "2025-09-12T08:12:00Z" },
  { id: "DEMO-075", contactId: "98312", value: 87000, status: "open", updatedAt: "2025-09-08T16:40:00Z" },
];

export const demoThreads: DemoThread[] = [
  {
    id: "thread-42",
    channel: "#sales-nord",
    snippet: "Tråden om onboarding av Fjordtek er oppdatert med statusrapport",
    participants: ["Mona", "Eirik", "Helene"],
    updatedAt: "2025-09-18T07:55:00Z",
    platform: "Slack",
  },
  {
    id: "thread-45",
    channel: "Team NordVest",
    snippet: "Møteagenda delt for neste ukes demo",
    participants: ["Andre", "Sumitra"],
    updatedAt: "2025-09-17T15:10:00Z",
    platform: "Teams",
  },
  {
    id: "thread-39",
    channel: "#kunde-visma",
    snippet: "Visma support bekrefter kostnadsavviket",
    participants: ["Jon", "Kristine"],
    updatedAt: "2025-09-17T09:30:00Z",
    platform: "Slack",
  },
];

export const demoWorkspaceEntries: DemoWorkspaceEntry[] = [
  {
    id: "doc-411",
    title: "Visma pilot – samarbeidsavtale",
    kind: "doc",
    owner: "Maja Solheim",
    updatedAt: "2025-09-18T08:24:00Z",
  },
  {
    id: "sheet-203",
    title: "Fjordtek Q4 forecast",
    kind: "sheet",
    owner: "Erlend Huse",
    updatedAt: "2025-09-17T17:02:00Z",
  },
  {
    id: "doc-392",
    title: "Demo-notater – Google Workspace",
    kind: "doc",
    owner: "Taran Hove",
    updatedAt: "2025-09-16T12:45:00Z",
  },
  {
    id: "mail-901",
    title: "Utkast: Oppsummering demo",
    kind: "mail",
    owner: "Espen Brattli",
    updatedAt: "2025-09-16T08:15:00Z",
  },
];

export const demoVisma: DemoVismaData = {
  kpis: [
    { id: "kpi-recovery", label: "Inndrevet", value: 680000, target: 720000, unit: "NOK", trend: "up" },
    { id: "kpi-overdue", label: "Forfalt", value: 120000, target: 80000, unit: "NOK", trend: "down" },
    { id: "kpi-reminders", label: "Purringer sendt", value: 18, target: 12, unit: "stk", trend: "flat" },
  ],
  collections: {
    cost: [
      { id: "cost-sms", label: "SMS", value: 6200 },
      { id: "cost-post", label: "Post", value: 3900 },
      { id: "cost-fees", label: "Gebyr", value: 2400 },
    ],
    time: [
      { id: "time-internal", label: "Internt arbeid", value: 12 },
      { id: "time-auto", label: "Automatisert", value: 28 },
      { id: "time-wait", label: "Ventetid", value: 8 },
    ],
    reminders: [
      { id: "rem-first", label: "Første", value: 12 },
      { id: "rem-second", label: "Andre", value: 4 },
      { id: "rem-third", label: "Tredje", value: 2 },
    ],
  },
};
