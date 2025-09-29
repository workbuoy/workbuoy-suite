import helmet from 'helmet';
import type { RequestHandler } from 'express';

export function buildHelmet(): RequestHandler {
  const csp = {
    useDefaults: true,
    directives: {
      defaultSrc: ["'none'"],
      connectSrc: ["'self'"],
      imgSrc: ["'self'","data:"],
      fontSrc: ["'self'","data:"],
      styleSrc: ["'self'"],
      scriptSrc: ["'self'"],
      frameAncestors: ["'none'"],
      baseUri: ["'none'"]
    }
  } as const;

  return helmet({
    contentSecurityPolicy: csp,
    frameguard: { action: 'deny' },
    referrerPolicy: { policy: 'no-referrer' },
    crossOriginOpenerPolicy: { policy: 'same-origin' },
    crossOriginResourcePolicy: { policy: 'same-origin' }
  });
}
