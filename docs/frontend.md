# Frontend – utviklerguide

## Scripts
```bash
npm run dev   # utvikling
npm run build # bygg
npm run test  # tester (der de finnes)
```

## Mocker
Frontend forventer mockede fetch-kall i dev:
- `/api/addons` — manifest over add-ons
- `/api/crm/contacts` — liste/ny kontakt
- `/core/actions/commit` — round-trip stub for “Vis i CRM”

> I ekte miljø erstattes disse av Dev-agentens backend.

## Tips
- Bruk **ModeSwitch** i FlipCard-headeren for å simulere policy-nivåer i UI.
- “Vis hvorfor” (`WhyDrawer`) finnes i `features/buoy`.
- Morphing Input støtter `@kontakt`, `=kalkulator` og enkle kommandoer (se `docs/commands.md`).