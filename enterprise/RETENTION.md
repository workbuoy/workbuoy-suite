# RETENTION.md

Retention rules per data type. The runtime script reads from `config/retention.json`.

## Summary
- Sessions: 30 days after last activity.
- Audit events: 12 months (or longer if required by policy).
- Consent log: 10 years.
- Erasure tombstones: 10 years (evidence for compliance).

## Machine-readable rules
```json
{
  "tables": {
    "sessions": {"keep_days": 30, "ts_column": "last_seen"},
    "audit_events": {"keep_days": 365, "ts_column": "ts"},
    "consent_log": {"keep_days": 3650, "ts_column": "ts"},
    "erasure_tombstones": {"keep_days": 3650, "ts_column": "erased_at"}
  }
}
```

Run the purge cron:
```bash
node scripts/cron/purge-retention.js
```
