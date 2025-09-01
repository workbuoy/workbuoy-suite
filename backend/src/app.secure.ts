import express from 'express';
import morgan from 'morgan';
import cookieParser from 'cookie-parser';
import { buildHelmet } from './security/helmet.js';
import { buildCors } from './security/cors.js';
import { buildApiLimiter, buildWebhookLimiter } from './security/rateLimit.js';

const app = express();

app.disable('x-powered-by');
app.use(buildHelmet());
app.use(buildCors());
app.use(morgan('tiny'));
app.use(cookieParser());

// Protect APIs with rate limit
app.use('/api', buildApiLimiter());
app.use('/api/v1/connectors', buildWebhookLimiter());

app.get('/healthz', (_req,res)=>res.json({ ok: true }));

export default app;
