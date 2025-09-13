# Buoy Chat + Search + Action — Integrated UX (v2.4.4 concept)

## Why
- One input, one experience: users write naturally; system structures, filters, visualizes, and proposes actions.
- No context switching to a “search page”. Navi is the back-side cockpit when you want more space.

## UX Flow
1. **User input** (natural): “vis acme siste 30 dager, filtrer region vest, sorter på størst deal, lag graf”
2. **Parse** to `GlobalSearchQuery` → show **chips**: `kunde:acme` · `tidsrom:30d` · `region:vest` · `sort:deal_størrelse` · `viz:line`
3. **Respond** as a **ResultCard** (table/line) with inline actions: simulate · draft · approve · why?
4. **Refine in place**: click chips (× to remove), quick-keys (`f` filter, `v` visualize, arrows to browse suggestions), or keep typing.
5. **Drill**: clicking a bar adds a filter; same thread updates. “Open in Navi” flips to cockpit layout.

## Query model
```ts
export type Intent = 'list'|'brief'|'visualize'|'simulate'|'approve';
export interface GlobalSearchQuery {
  text?: string;
  filters: Record<string, string|number|boolean|string[]>;
  scope: 'user'|'team'|'org';
  sort?: string;
  viz?: 'table'|'line'|'bar'|'pie'|'kpi';
}
```

## Observability & Policy
- OTel spans: `chat.parse` → `buoy.plan` → `search.exec` → `viz.render` → `action.exec` (all with `pii_masked=true`).
- Policy guard (0–2) gates write-intents; WhyDrawer shows `explanations[]` with `policyBasis`, `sources`, `impact`.

## Performance
- Debounce 150 ms on input; P50 < 150 ms / P95 < 400 ms with in-memory datasets; virtualize lists > 1k rows.

## Demo scenarios
- **CRM**: “vis alle åpne deals over 100k for acme siste kvartal som tabell” → chips → table + simulate-followup.
- **ERP**: “lag en graf av forfalte fakturaer 30d og utkast purring” → line chart + draft dunning (ask approval).
- **Email**: “finn siste epost fra kari om tilbud acme og lag oppgave” → brief + create task (policy-gated).
