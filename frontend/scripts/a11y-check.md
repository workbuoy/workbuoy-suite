# A11y smoke check

Kjør denne sjekklisten før du leverer nye demoer.

1. **Start appen**
   ```bash
   pnpm --filter frontend dev
   ```
   Vent til Vite viser `Local: http://localhost:5173/`.

2. **Kjør axe mot hovedskjermene**
   ```bash
   pnpm --filter frontend exec axe http://localhost:5173/
   pnpm --filter frontend exec axe http://localhost:5173/#/navi
   ```
   Ingen `serious` eller `critical` funn skal stå igjen.

3. **Kjør pa11y for en end-to-end rapport**
   ```bash
   pnpm --filter frontend exec pa11y http://localhost:5173/
   ```
   Dokumentér eventuelle `warning`-funn i PR-beskrivelsen og lag egne oppgaver ved behov.

4. **Tastaturnavigasjon**
   - Fokus skal ligge innenfor åpne dialoger.
   - `Esc` skal lukke modaler og toasts.
   - Alle `switch`-kontroller skal ha `aria-checked`.

5. **Screen reader spot-sjekk**
   - Verifiser at toasts annonseres med «polite» live-region.
   - WhyDrawer skal ha `aria-labelledby` og beskrivelser.

> Tips: Kjør gjerne `pnpm --filter frontend test -- --runInBand` etter justeringer for å fange fokusfeller tidlig.
