# Decisions Log

## 2026-02-11 — Minimal-inngripende stabilisering først
- Vi beholder npm workspaces og eksisterende app-struktur.
- Vi prioriterer å reparere tydelige integrasjonsbrudd (compose entrypoint, frontend-proxy, dev scripts) fremfor arkitektur-endringer.

## 2026-02-11 — META-modus skal være lokal og opt-in
- META-verktøy implementeres som `npm run meta`.
- Verktøyet skal kun generere backlog/suggestions lokalt, og aldri auto-applisere patcher.
- Ingen nettverkskall eller secrets-eksfiltrering i default workflow.
