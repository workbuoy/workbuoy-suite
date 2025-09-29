import app from './server.js';

const port = Number(process.env.PORT || 3000);
const httpServer = app.listen(port, () => {
  console.log(`[workbuoy] backend listening on :${port}`);
});

function gracefulShutdown(signal: string) {
  console.log(`[server] received ${signal}, shutting down...`);
  try {
    const stopJobs = (globalThis as typeof globalThis & {
      __wb_stopJobs?: () => void;
    }).__wb_stopJobs;
    if (typeof stopJobs === 'function') {
      try {
        stopJobs();
      } catch (err) {
        console.warn('[server] stopJobs threw:', err);
      }
    }

    httpServer.close((err) => {
      if (err) {
        console.error('[server] close error:', err);
        process.exit(1);
      } else {
        console.log('[server] closed');
        process.exit(0);
      }
    });

    setTimeout(() => process.exit(1), 5000).unref();
  } catch (err) {
    console.error('[server] shutdown threw:', err);
    process.exit(1);
  }
}

process.once('SIGTERM', () => gracefulShutdown('SIGTERM'));
process.once('SIGINT', () => gracefulShutdown('SIGINT'));
