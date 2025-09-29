// Ensure Rollup uses JS fallback before any imports that might load rollup
process.env.ROLLUP_SKIP_NODEJS_NATIVE = 'true';

const { startVitest } = await import('vitest/node');

const cliArgs = process.argv.slice(2);
const isWatch = cliArgs.some((arg) => arg === '--watch' || arg === '-w');

if (isWatch) {
  const filteredArgs = cliArgs.filter((arg) => arg !== '--watch' && arg !== '-w');
  await startVitest('watch', filteredArgs);
} else {
  await startVitest('test', ['run', ...cliArgs]);
}
