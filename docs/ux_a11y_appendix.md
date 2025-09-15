# Tilgjengelighet og tema (PR-8)

## Prinsipper
- **Tastatur:** Alle interaksjoner kan utføres uten mus (flip → Space/Enter).
- **ARIA:** FlipCard, BuoyChat, Navi har `role` + `aria-label` for skjermlesere.
- **Fokus:** Synlige fokusringer (`:focus-visible` i `tokens.css`).
- **Responsivitet:** `tokens.css` justerer spacing/radius for små skjermer.
- **Tema:** Alle farger definert som CSS-variabler i `tokens.css`.

## Test
- Naviger med Tab → fokusring synlig.
- Flip kortet med Space/Enter når FlipCard er fokusert.
- Bruk Lighthouse eller axe-core → ingen kritiske A11y-feil.

## Neste steg
- Dev: Integrere axe-core tests i CI.
- UX: Evaluere dark/light temaer med samme tokens.