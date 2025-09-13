# PR — Buoy Chat integrates Search + Filters + Visuals (Navi hand-off)

**What’s included**
- `docs/BUOY_CHAT_SEARCH.md` — product/UX design.
- FE types (`frontend/src/buoy/types.ts`), parser (`frontend/src/buoy/parser.ts`).
- Components: `BuoyChat`, `Chips`, `ResultCard` wired to call `POST /buoy/complete`.
- Tests: parser + smoke for chat.

**How to use**
- Render `<BuoyChat />` in your chat surface or cockpit.
- Endpoint expected: `POST /buoy/complete` (MVP can echo).

**Run tests**
```
pnpm -C frontend test
```

**Follow ups**
- Replace mock visualization with actual charts.
- Hook actions (simulate/draft/approve) behind policy v2 (ask_approval on 2).
- “Open in Navi” should push the same `GlobalSearchQuery` into addon layout.
