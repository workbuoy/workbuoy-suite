# Buoy CRM – Oppdatert roadmap (Track C)

**Dato:** 27. august 2025

## Fase 1 – Foundations (Uke 1–2)
- ✅ DB (Prisma/Postgres), CRUD API (GET/POST + GET/:id, PUT, DELETE)
- ✅ Experimental-portal (/portal/crm) m/ summarize-stub
- ✅ Metrics: wb_crm_entities_total{type}, wb_crm_ai_summaries_total
- ✅ /api/metrics
- ✅ Seed + Docker Compose
- ➡️ Coverage >80% lib/crm (pågår)

## Fase 2 – AI Layer (Uke 3–4)
- ☐ Ingest-signalgrensesnitt (email, calendar, Slack, tickets)
- ☐ NLP-ekstraksjon og auto-deal
- ☐ AI suggestions stub (✅ endepunkt) → kobles til ekte agent
- ☐ Valgfri sync mot Salesforce/HubSpot (feature flag)

## Fase 3 – UI Workspace (Uke 5–6)
- ☐ Pipeline board (Kanban) + liste
- ☐ Kontaktkort m. kontekst
- ☐ Hurtig-AI fra UI (summaries + suggestions) – **delvis levert (stub)**

## Fase 4 – AI Summaries & Suggestions (Uke 7–8)
- ☐ Ekte summarization
- ☐ Follow-up forslag (koblet til tasks)
- ☐ Deal health score
- ☐ Notifications (portal + desktop)

## Fase 5 – Sync & Standalone (Q4)
- ☐ Roundtrip sync Salesforce/HubSpot
- ☐ Standalone modus
- ☐ CSV-import (✅ endepunkt, grunnleggende)
- ☐ Ekspederte metrics i /api/metrics

## Fase 6 – Desktop (Q1)
- ☐ Varsler for deals
- ☐ Hurtigregistrering i tray
- ☐ Offline (SQLite)
