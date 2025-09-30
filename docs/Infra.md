# Infra & Storage Guide

Denne siden beskriver hvor Workbuoy-suite lagrer data (“WB-ting”), hvilke eksterne tjenester som anbefales i prod, og hvilke miljøvariabler som styrer oppsettet.

## Oversikt over lagring

- **Database (app-data / “WB-ting”)**
  - Styres av `DATABASE_URL` (Prisma).
  - Dev: SQLite/Postgres lokalt.
  - CI: Ephemeral/temporary.
  - Prod: Administrert Postgres (f.eks. AWS RDS, Cloud SQL, Neon, Render).
  - Migrasjoner kjøres via Prisma og er idempotente.

- **Filer / binære vedlegg**
  - Anbefalt: S3-kompatibel storage (AWS S3, Cloudflare R2, MinIO).
  - Konfig via env: `S3_ENDPOINT` (valgfri), `S3_REGION`, `S3_BUCKET`, `S3_ACCESS_KEY_ID`, `S3_SECRET_ACCESS_KEY`, `S3_FORCE_PATH_STYLE` (valgfri).
  - Hvis ikke aktivert, bør apper unngå å lagre binært utenfor DB.

- **Metrics / telemetri**
  - Backend eksponerer `/metrics` (Prometheus-format).
  - Prod: Konfigurer Prometheus scrape + Grafana dashboards.
  - Fallback: Ingen persistens uten ekstern Prometheus.

- **Logger**
  - Skrives til stdout. I prod: ship til logg-lager (Loki, Datadog, CloudWatch).
  - Strukturert logging anbefales (JSON) for enklere søk.

- **Frontend Storybook**
  - Bygges statisk og kan publiseres til GitHub Pages (se `ui-storybook` workflow).
  - Lagring: GitHub Pages artefakter.

- **CI-artefakter**
  - Lagring i GitHub Actions artifacts (midlertidig).
  - Behandles automatisk av workflowene.

- **Hemmeligheter**
  - CI: GitHub Secrets / Environments.
  - Prod: bruk plattformens secret store (AWS SSM/Secrets Manager, GCP Secret Manager, etc.).

## Data residency og multitenancy

- **Region** bestemmes av DB-instansen og S3-bucket-regionen du velger per miljø/kunde.
- **Multitenancy** håndteres i applikasjonen (DB-skjema/kolonner). Infra gir ikke automatisk fysisk isolasjon; velg single-tenant DB pr kunde hvis nødvendig.

## Prod sjekkliste

1. **Database**  
   - Sett `DATABASE_URL` til administrert Postgres i riktig region.  
   - Aktiver automatiske backups + PITR hvis tilgjengelig.

2. **Object storage (S3/R2/MinIO)**  
   - Opprett bucket per miljø (og ev. per kunde).  
   - Sett lifecycle rules (arkivering/sletting etter behov).  
   - Konfigurer env for tilgang (se eksempler under).

3. **Metrics**  
   - Legg inn Prometheus scrape-jobb mot backend `/metrics`.  
   - Opprett Grafana dashboards/alerts.

4. **Logging**  
   - Send stdout til sentralt logg-lager.  
   - Lag bevarings- og tilgangspolicyer.

5. **Secrets**  
   - Sett opp secrets i prod-plattformen (ikke sjekk inn `.env`).  
   - Roter nøkler regelmessig.

6. **Sikkerhet & compliance**
   - Definér data residency pr kunde.
   - Sett opp IAM-roller, minst-privilegium, og MFA for drift.

## Auth & cookies

- **Secure cookies i prod:** Autentiseringsmodulen setter sesjonskaker med `HttpOnly`, `SameSite=lax` og `Secure` når `NODE_ENV=production`. I lokale/dev-miljøer (annet enn `production`) droppes `Secure` slik at http://-apper fortsatt kan logge inn.
- **Dev-mock av OIDC:** Mock-inloggingsflyten er nå av som standard. Sett `OIDC_DEV_MOCK=1` eksplisitt dersom dere ønsker den for lokale tester. I prod bør dette være `0` eller unset.

## Miljøvariabler

> NB: Ikke sjekk inn ekte nøkler. Bruk `.env` lokalt og secrets i CI/prod.

**Generelle:**
- `NODE_ENV` = `development` | `production`
- `LOG_LEVEL` = `info` | `debug` | `warn` | `error`
- `OIDC_DEV_MOCK` = `1` for å aktivere mock-login i dev (default `0`/av)

**Database (Prisma/Backend):**
- `DATABASE_URL` (Postgres-URL. Eksempel: `postgresql://user:pass@host:5432/db?schema=public`)

**Object storage:**
- `S3_ENDPOINT` (valgfri for MinIO/R2, eks: `https://<account>.r2.cloudflarestorage.com`)
- `S3_REGION` (eks: `eu-west-1`)
- `S3_BUCKET`
- `S3_ACCESS_KEY_ID`
- `S3_SECRET_ACCESS_KEY`
- `S3_FORCE_PATH_STYLE` = `true|false` (valgfri, ofte `true` for MinIO)

**Metrics:**
- Ingen obligatoriske env for å eksponere `/metrics`. Prometheus konfigureres eksternt.

**UI/Storybook (CI):**
- `ROLLUP_SKIP_NODEJS_NATIVE=1`
- `ROLLUP_SKIP_NATIVE=1`

## Eksempel-filer

Se `.env.example` og `packages/*/.env.example` for startverdier.

### `.env.example` (root)
```env
# Node & logging
NODE_ENV=development
LOG_LEVEL=info

# Database
DATABASE_URL=postgresql://postgres:postgres@localhost:5432/workbuoy?schema=public

# Object storage (valgfritt for dev)
S3_REGION=eu-west-1
S3_BUCKET=workbuoy-dev
S3_ACCESS_KEY_ID=dev-access-key
S3_SECRET_ACCESS_KEY=dev-secret
S3_FORCE_PATH_STYLE=true
# S3_ENDPOINT=http://localhost:9000  # MinIO lokalt
```

### `packages/backend/.env.example`
```env
# Overskriver root ved behov
DATABASE_URL=postgresql://postgres:postgres@localhost:5432/workbuoy?schema=public

# Optional metrics toggle (om dere har en slik feature flag)
# METRICS_ENABLED=true
```

### `packages/ui/.env.example`
```env
# Storybook / Vitest (CI-stabilitet)
ROLLUP_SKIP_NODEJS_NATIVE=1
ROLLUP_SKIP_NATIVE=1
```

## Driftstips

### Backups

- **DB:** Slå på daglige snapshots + PITR der mulig. Test restore jevnlig.
- **S3:** Bruk versjonering og lifecycle rules for retention.

### Observability

- Alerts på DB CPU, IOPS, lagring, connections.
- Alerts på 5xx-rate i backend + responstider.
- Dashboards for /metrics, logg-søk på feil.

### Sikkerhet

- Least-privilege IAM-brukere.
- Roter secrets.
- Separate prosjekter/Accounts per miljø (dev/staging/prod).

## Vanlige spørsmål

**Hvor lagres kundedata?**
I DB (Postgres) i valgt region, og ev. binært i S3-bucket i samme (eller dokumentert) region.

**Kan vi segregere på kundebasis?**
Ja – enten logisk i en multi-tenant DB eller fysisk per-tenant DB/bucket. Velg etter krav til isolasjon og compliance.

**Hvordan flytter vi data mellom regioner?**
Bruk database-replikering/eksport + synkronisering av buckets. Planlegg nedetid/switch.
