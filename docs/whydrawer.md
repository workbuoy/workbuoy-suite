# WhyDrawer polish (PR-26)

**Mål:** Gjøre forklaringer lettleste og handlingsbare.
- Støtter både `string[]` (tilbakekompatibelt) og objekter `{ title, quote, link, source }`.
- A11y: `role="dialog"`, `aria-modal`, ESC for å lukke, fokus settes til første knapp.
- Verktøy: **Kopier**-knapp for å ta med sitater inn i e-post/Slack, **Åpne kilde**-lenker pr. rad.

## API
```ts
type ExplanationIn = string | { title?: string; quote?: string; link?: string; source?: string };
<WhyDrawer explanations={...} onClose={()=>...} title="Hvorfor?" />
```

## Videre
- Render markdown i quotes (begrenset).
- Ikoner per kilde (CRM, ERP, E-post).
- Sammendrag i toppen (“Basert på 3 kilder”).