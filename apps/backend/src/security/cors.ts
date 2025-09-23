import cors from 'cors';

export function buildCors() {
  const raw = process.env.CORS_ORIGINS || '';
  const allowlist = raw.split(',').map(s=>s.trim()).filter(Boolean);

  if (allowlist.length === 0) {
    // default: no cross-origin (API used by server-to-server or same-origin)
    return cors({ origin: false });
  }

  if (allowlist.includes('*')) {
    return cors({ origin: true, credentials: true });
  }

  return cors({
    origin: (origin, cb) => {
      if (!origin) return cb(null, false);
      const ok = allowlist.some(a => origin === a);
      cb(null, ok);
    },
    credentials: true
  });
}
