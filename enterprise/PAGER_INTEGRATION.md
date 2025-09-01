# Pager Integration

## Webhook
- Configure Prometheus Alertmanager to send to PagerDuty / Opsgenie with route keys by `severity`.

## Test Alarm Procedure
1. Fire a synthetic alert by incrementing `wb_auth_abuse_block_total` in a test.
2. Verify pager receives the incident.
3. Acknowledge and resolve; attach artifact to post-mortem.

Route keys & webhook URLs stored in secrets manager.
