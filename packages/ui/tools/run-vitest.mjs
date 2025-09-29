process.env.ROLLUP_SKIP_NODEJS_NATIVE = 'true';
process.env.ROLLUP_SKIP_NATIVE = 'true';

const { startVitest } = await import('vitest/node');
await startVitest('test', ['run', ...process.argv.slice(2)]);
