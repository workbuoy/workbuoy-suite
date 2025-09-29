// packages/ui/eslint.config.mjs
import js from '@eslint/js';
import tsParser from '@typescript-eslint/parser';
import reactHooks from 'eslint-plugin-react-hooks';
import importPlugin from 'eslint-plugin-import';

export default [
  // Base (kun for å ha noen fornuftige standarder)
  {
    files: ['**/*.js'],
    ...js.configs.recommended,
  },

  // UI workspace overrides (gjelder for .ts/.tsx i UI-src)
  {
    name: 'ui:node-resolver-and-rule-shutdown',
    files: ['src/**/*.{ts,tsx}'],
    ignores: [],
    plugins: {
      'react-hooks': reactHooks,
      import: importPlugin,
    },
    languageOptions: {
      parser: tsParser,
      parserOptions: {
        // Kritisk: ikke prøv prosjekt-basert typeinfo (hindrer TS-resolver)
        project: null,
      },
    },
    settings: {
      // Kritisk: bare node-resolver, ingen typescript-resolver
      'import/resolver': {
        node: { extensions: ['.js', '.jsx', '.ts', '.tsx'] },
      },
    },
    rules: {
      // Slå av alle regler som trigger import-resolver
      'import/no-unresolved': 'off',
      'import/named': 'off',
      'import/namespace': 'off',
      'import/default': 'off',
      'import/no-named-as-default': 'off',
      'import/no-named-as-default-member': 'off',
    },
  },
];
