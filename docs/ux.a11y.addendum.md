## Tilgjengelighet (A11y) — prinsipper og implementasjon (PR-8)

- **Tastatur først:** Flip-kortet kan fokuseres (`tabIndex=0`), og flippes med Space/Enter.
- **ARIA-roller:** `role="application"` på flip-host, `role="region"` + `aria-label` på Buoy/Navi/Panel.
- **Live regions:** Chat har `aria-live="polite"` for nye meldinger uten å stjele fokus.
- **Fokusringer:** Global `:focus-visible` ring i `styles/tokens.css`; kontrast-vennlig.
- **Responsive fallback:** På små skjermer deaktiveres 3D-rotasjon; Buoy/Navi vises flatt i samme plan.
- **Redusert bevegelse:** Respekterer `prefers-reduced-motion` → minimal animasjon.
- **Høy-kontrast:** `@media (forced-colors)` gir lesbar kant/tekst.

**Test (manuelt):**
1. Tab til flip-kortet → trykk Space/Enter → sider skifter.
2. Naviger til Buoy → skriv melding → ny melding dukker opp uten fokus-stjeling.
3. Endre vindusstørrelse → se mobil-fallback (ingen 3D-rotasjon).