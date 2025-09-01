# Design Tokens Guide – Buoy CRM

Dette dokumentet beskriver de viktigste design-tokens og komponentklassene i `styles/buoy.css`.

## Tokens (CSS variables)
- **Farger:** `--wb-bg`, `--wb-surface`, `--wb-border`, `--wb-text`, `--wb-subtle`
- **Brand:** `--wb-primary`, `--wb-primary-600`, `--wb-accent`, `--wb-danger`, `--wb-success`, `--wb-warm-1`
- **Bakgrunn:** `--wb-hero-grad`
- **Dark mode:** Override i `@media (prefers-color-scheme: dark)`

## Komponentklasser
- **Layout:** `.wb-container`, `.wb-header`, `.wb-hero`, `.wb-page`
- **Typografi:** `.wb-title`, `.wb-sub` (+ `font-feature-settings: 'ss01'`)
- **Kort/tabeller:** `.wb-card`, `.wb-table`
- **Knapper/badges:** `.wb-btn`, `.wb-btn--primary`, `.wb-badge`
- **Kanban:** `.wb-kanban`, `.wb-col`, `.wb-col__head`, `.wb-col__body`, `.wb-card--deal`

## Mikrosamspill
- **Hover:** kort og knapper har subtile løft og skygge (`transform`, `box-shadow`).  
- **Følger OS-tema:** Dark mode via `prefers-color-scheme`.

For UI-eksempler, se `/portal/crm/design`.
