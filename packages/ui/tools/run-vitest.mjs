process.env.ROLLUP_SKIP_NODEJS_NATIVE = 'true';
process.env.ROLLUP_SKIP_NATIVE = 'true';

const { startVitest } = await import('vitest/node');

const args = ['run', '--reporter=default', '--passWithNoTests', ...process.argv.slice(2)];
if (!args.includes('--coverage')) {
  args.push('--coverage');
}

const vitest = await startVitest('test', args);
const exitCode = typeof vitest?.getExitCode === 'function' ? await vitest.getExitCode() : undefined;
if (typeof vitest?.close === 'function') {
  await vitest.close();
}
if (typeof exitCode === 'number') {
  process.exitCode = exitCode;
}
