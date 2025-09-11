# STATUS (MVP snapshot)

- Core rails: logger/PII ✅, errorHandler ✅, policy (0–2) ✅, EventBus+DLQ (MVP) ✅, audit hashchain ✅ + verify() ✅
- APIs: CRM ✅ (guard on write), Tasks ✅, Log ✅
- UI: Navi (slider, tasks, log, WhyDrawer) ✅
- OpenAPI: CRM+Tasks+Log ✅, lint-ready ✅
- CI: backend-ci ✅; coverage gate ≥80% ⚠ (enable now); openapi-lint optional ⚠ (make required after green streak)

Next:
- Turn on coverage gate (80%)
- Make openapi-lint required after 2 green PRs
- Add event-bus handler metrics and DLQ inspection endpoint (optional)
