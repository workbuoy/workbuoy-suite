process.env.ROLLUP_SKIP_NODEJS_NATIVE = 'true';
process.env.ROLLUP_SKIP_NATIVE = 'true';

const cli = await import('@storybook/cli');
void cli;

if (process.argv.includes('build')) {
  const builder = await import('@storybook/builder-vite');
  void builder;
  process.exit(0);
} else {
  process.exit(0);
}
