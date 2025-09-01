import { withVerifiedWebhook } from '../../../lib/webhooks/security';
import { appendAudit } from '../../../lib/secure/audit';

export const config = { api: { bodyParser: false } };

const handler = async (req, res) => {
  // domain logic for the webhook (req.rawBody is Buffer)
  await appendAudit({ type: 'connector_webhook', source: 'generic', size: req.rawBody.length });
  res.status(200).json({ ok: true });
};

// Secret should be pulled from secrets backend; for demo we use env
export default withVerifiedWebhook(handler, { secret: process.env.CONNECTOR_WEBHOOK_SECRET, source: 'generic' });
