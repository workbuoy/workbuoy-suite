module.exports = {
  extends: ['../../.eslintrc.cjs'],
  settings: {
    // Force the import plugin to resolve with Node, not TS resolver
    'import/resolver': {
      node: { extensions: ['.js', '.jsx', '.ts', '.tsx'] },
    },
  },
  overrides: [
    {
      files: ['**/*.stories.tsx', '**/*.test.tsx'],
      rules: {
        // Storybook/RTL often pull virtual/aliased modules; avoid noisy false positives in CI
        'import/no-unresolved': 'off',
        'import/default': 'off',
        'import/namespace': 'off',
        'import/no-named-as-default': 'off',
        'import/no-named-as-default-member': 'off',
      },
    },
  ],
};
