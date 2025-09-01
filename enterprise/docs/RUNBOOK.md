# RUNBOOK

How to run locally

## Business Foundation Setup

1. **Stripe**
   - Set `STRIPE_SECRET_KEY`, `STRIPE_PUBLIC_KEY`, and `STRIPE_WEBHOOK_SECRET` in `.env.local`.
   - Optional: `STRIPE_PORTAL_RETURN_URL` for the Customer Portal.
2. **Onboarding**
   - Static pages under `/public/register.html` and `/public/pricing.html` follow the locked UI (86% container, 72vh panels, glass look).
   - Client script: `/public/js/onboarding/registration.js`.
3. **Pricing Config**
   - `/public/config/pricing.json` contains Core plans and Flex ranges.
4. **Billing APIs**
   - Subscriptions: `pages/api/billing/create-subscription.js` (Core, 7‑day trial via Checkout).
   - One‑off: `pages/api/billing/create-payment.js` (Flex).
   - Portal: `pages/api/billing/create-portal-session.js`.
   - Webhook: `pages/api/stripe/webhook.js` tags trial/convert/cancel and updates `subscriptions`.
5. **Analytics**
   - `/api/metrics` now exposes counters: `wb_onboarding_started_total`, `wb_trial_started_total`, `wb_trial_converted_total`, `wb_flex_paid_total`, etc.
6. **Database**
   - New migrations: `0008_subscriptions`, `0009_usage_events`, `0010_flex_jobs` (SQLite).
   - Tables are auto‑created by APIs if not present for local runs.

## CXM Intelligence v2 — Quick Start (dev)

1. Migrer DB
   ```bash
   node scripts/migrate.js
   ```
2. Start app + scheduler
   ```bash
   npm run dev & node scripts/scheduler.js
   ```
3. Åpne `/` → HUD viser topp‑3 signaler; Focus API: `GET /api/focus/signals`.
4. Feedback:
   ```bash
   curl -X POST /api/signals/feedback -H 'Content-Type: application/json'      -d '{"signal_id":"1","type":"analytics:target_gap","action":"acted"}'
   ```
5. Fakta: `GET /api/cxm/analytics/facts?date=YYYY-MM-DD`

## Integrasjoner (web) — Quick Start

1. Migrer DB for integrasjoner:
   ```bash
   node scripts/migrate.js
   ```
2. Start app (dev):
   ```bash
   npm run dev
   ```
3. Åpne `/` og trykk **Integrasjoner**-chip i toppbaren.
4. Manuell web-scan (valgfritt):
   ```bash
   curl -X POST /api/integrations/discover -H 'Content-Type: application/json' -d '{"email":"user@acme.com","found":[{"vendor":"slack","product":"slack"}]}'
   ```
5. Hent forslag:
   ```bash
   curl /api/integrations/suggested
   ```
6. Koble til én provider (dev auto-`connected`):
   ```bash
   curl -X POST /api/integrations/connect -H 'Content-Type: application/json' -d '{"provider":"slack"}'
   ```
