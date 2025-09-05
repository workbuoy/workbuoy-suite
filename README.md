# WorkBuoy Suite

WorkBuoy Suite is an AI‑first office platform built around two core primitives: **Buoy AI** and **Navi**. It replaces traditional apps and menus with context‑aware suggestions and autonomous execution.

## Architecture

* **CORE** – the heart of WorkBuoy. All integrations (CRM, Visma ERP, email), Buoy, Navi, policy hooks, audit logging and explainability live here.
* **FLEX** – on‑demand mode of the CORE used for ad‑hoc requests. Uses the same endpoints but is triggered manually or via batch jobs.
* **SECURE** – compliance‑focused mode of the CORE. Enforces stricter policies (e.g. autonomy levels, data redaction, EU‑only processing).

Buoy and Navi live in CORE and behave the same across all modes. **Navi** sets the autonomy level (0 = suggest only, 1 = auto + receipt, 2 = full auto + summary). **Buoy** executes and displays drafts, actions and receipts, always with explanations.  
For more details, see [docs/core.md](docs/core.md) and [docs/secure.md](docs/secure.md). The current project status is tracked in [STATUS.md](STATUS.md).

## Release Orchestrate (GitHub Actions)
Se `.github/workflows/release-orchestrate.yml`. Kjør via Actions → workbuoy‑release‑orchestrate med inputs `modules` og `environment`.

## CI Templates

- GitLab CI: `.gitlab‑ci.yml`
- Azure DevOps: `azure‑pipelines.yml`


