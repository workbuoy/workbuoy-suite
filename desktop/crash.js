const Sentry = require('@sentry/electron');
const { app } = require('electron');

function init() {
  const dsn = process.env.SENTRY_DSN || '';
  if (!dsn) return;
  Sentry.init({
    dsn,
    environment: process.env.SENTRY_ENV || process.env.NODE_ENV || 'production',
    release: `workbuoy-desktop@${app.getVersion()}`,
    tracesSampleRate: Number(process.env.SENTRY_TRACES_SAMPLE_RATE || 0.1)
  });
  process.on('uncaughtException', (err) => {
    Sentry.captureException(err);
  });
  process.on('unhandledRejection', (reason) => {
    Sentry.captureException(reason instanceof Error ? reason : new Error(String(reason)));
  });
}

module.exports = { init };