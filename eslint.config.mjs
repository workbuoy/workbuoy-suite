import path from 'node:path';
import { fileURLToPath } from 'node:url';

import js from '@eslint/js';
import tsParser from '@typescript-eslint/parser';
import tsPlugin from '@typescript-eslint/eslint-plugin';
import importPlugin from 'eslint-plugin-import';
import eslintPluginN from 'eslint-plugin-n';
import promisePlugin from 'eslint-plugin-promise';
import reactPlugin from 'eslint-plugin-react';
import reactHooksPlugin from 'eslint-plugin-react-hooks';
import jsxA11yPlugin from 'eslint-plugin-jsx-a11y';
import globals from 'globals';
import * as emptyParser from './tools/empty-parser.mjs';

const __dirname = path.dirname(fileURLToPath(import.meta.url));

const tsTypeChecked = tsPlugin.configs['recommended-type-checked'];
const tsStylistic = tsPlugin.configs['stylistic-type-checked'];
const importRecommended = importPlugin.configs.recommended;
const importTypescript = importPlugin.configs.typescript ?? { rules: {} };
const reactRecommended = reactPlugin.configs.recommended;
const reactJsxRuntime = reactPlugin.configs['jsx-runtime'];
const reactHooksRecommended = reactHooksPlugin.configs.recommended;
const jsxA11yRecommended = jsxA11yPlugin.configs.recommended;
const nodeRecommended = eslintPluginN.configs.recommended;
const promiseRecommended = promisePlugin.configs.recommended;

const commonTypeScriptRules = {
  ...js.configs.recommended.rules,
  ...tsTypeChecked.rules,
  ...tsStylistic.rules,
  ...importRecommended.rules,
  ...importTypescript.rules,
  '@typescript-eslint/no-unused-vars': 'off',
  '@typescript-eslint/ban-ts-comment': 'off',
  '@typescript-eslint/ban-types': 'off',
  '@typescript-eslint/consistent-type-imports': 'off',
  '@typescript-eslint/consistent-type-definitions': 'off',
  '@typescript-eslint/no-explicit-any': 'off',
  '@typescript-eslint/no-this-alias': 'off',
  '@typescript-eslint/no-var-requires': 'off',
  '@typescript-eslint/no-misused-promises': 'off',
  '@typescript-eslint/no-unsafe-assignment': 'off',
  '@typescript-eslint/no-unsafe-call': 'off',
  '@typescript-eslint/no-unsafe-member-access': 'off',
  '@typescript-eslint/no-unsafe-return': 'off',
  '@typescript-eslint/no-unsafe-argument': 'off',
  '@typescript-eslint/no-array-delete': 'off',
  '@typescript-eslint/array-type': 'off',
  '@typescript-eslint/await-thenable': 'off',
  '@typescript-eslint/no-base-to-string': 'off',
  '@typescript-eslint/no-duplicate-type-constituents': 'off',
  '@typescript-eslint/no-redundant-type-constituents': 'off',
  '@typescript-eslint/no-empty-function': 'off',
  '@typescript-eslint/no-empty-object-type': 'off',
  '@typescript-eslint/no-floating-promises': 'off',
  '@typescript-eslint/no-unnecessary-type-assertion': 'off',
  '@typescript-eslint/consistent-generic-constructors': 'off',
  '@typescript-eslint/class-literal-property-style': 'off',
  '@typescript-eslint/dot-notation': 'off',
  '@typescript-eslint/prefer-regexp-exec': 'off',
  '@typescript-eslint/prefer-promise-reject-errors': 'off',
  '@typescript-eslint/no-implied-eval': 'off',
  '@typescript-eslint/prefer-optional-chain': 'off',
  '@typescript-eslint/non-nullable-type-assertion-style': 'off',
  '@typescript-eslint/prefer-nullish-coalescing': 'off',
  '@typescript-eslint/require-await': 'off',
  '@typescript-eslint/no-require-imports': 'off',
  '@typescript-eslint/unbound-method': 'off',
  '@typescript-eslint/no-inferrable-types': 'off',
  'no-console': 'off',
  'no-constant-condition': 'off',
  'no-empty': 'off',
  'no-unsafe-finally': 'off',
  'no-useless-escape': 'off',
  'prefer-const': 'off',
  'no-undef': 'off',
  'import/no-duplicates': 'off',
};

export default [
  {
    files: ['**/*'],
    languageOptions: {
      parser: tsParser,
      parserOptions: {
        project: false,
      },
    },
    ignores: [
      'crm/**',
      'enterprise/**',
      'desktop/**',
      './enterprise/**',
      './desktop/**',
      '**/node_modules/**',
      '**/dist/**',
      '**/build/**',
      '**/.next/**',
      '**/coverage/**',
      'packages/**/dist/**',
      './packages/**/dist/**',
      'apps/**/dist/**',
      'apps/frontend/navi-mvp/**',
      './apps/frontend/navi-mvp/**',
      'apps/frontend/src/components/FlipCard/FlipCard.test.tsx',
      'apps/frontend/src/proactivity/useProactivity.test.ts',
      '**/*.generated.*',
      '**/lib/**',
      'scripts/fixtures/**',
    ],
    linterOptions: {
      reportUnusedDisableDirectives: false,
    },
  },
  {
    files: [
      'enterprise/**',
      'desktop/**',
      'crm/**',
      'apps/frontend/navi-mvp/**',
      'packages/**/dist/**',
      'apps/frontend/src/components/FlipCard/FlipCard.test.tsx',
      'apps/frontend/src/proactivity/useProactivity.test.ts',
    ],
    languageOptions: {
      parser: emptyParser,
    },
    rules: {},
  },
  {
    files: [
      'apps/backend/src/**/*.{js,ts,tsx}',
      'packages/*/src/**/*.{js,ts,tsx}',
      'packages/*/tests/**/*.{js,ts,tsx}',
    ],
    languageOptions: {
      parser: tsParser,
      parserOptions: {
        project: [
          './apps/backend/tsconfig.eslint.json',
          './packages/*/tsconfig.eslint.json',
        ],
        tsconfigRootDir: __dirname,
      },
      globals: globals.node,
    },
    plugins: {
      '@typescript-eslint': tsPlugin,
      import: importPlugin,
      n: eslintPluginN,
      promise: promisePlugin,
    },
    settings: {
      'import/resolver': {
        typescript: {
          project: [
            './apps/backend/tsconfig.eslint.json',
            './packages/*/tsconfig.eslint.json',
          ],
        },
        node: true,
      },
    },
    rules: {
      ...commonTypeScriptRules,
      ...nodeRecommended.rules,
      ...promiseRecommended.rules,
      'n/no-extraneous-import': 'off',
      'n/no-missing-import': 'off',
      'n/no-process-exit': 'off',
      'n/no-unsupported-features/es-syntax': 'off',
      'n/no-unsupported-features/node-builtins': 'off',
      'promise/param-names': 'off',
    },
  },
  {
    files: ['apps/frontend/**/*.{js,jsx,ts,tsx}'],
    ignores: [
      'apps/frontend/navi-mvp/**',
      'apps/frontend/src/components/FlipCard/FlipCard.test.tsx',
      'apps/frontend/src/proactivity/useProactivity.test.ts',
    ],
    languageOptions: {
      parser: tsParser,
      parserOptions: {
        project: ['./apps/frontend/tsconfig.eslint.json'],
        tsconfigRootDir: __dirname,
        ecmaFeatures: {
          jsx: true,
        },
      },
      globals: globals.browser,
    },
    plugins: {
      '@typescript-eslint': tsPlugin,
      import: importPlugin,
      react: reactPlugin,
      'react-hooks': reactHooksPlugin,
      'jsx-a11y': jsxA11yPlugin,
    },
    settings: {
      'import/resolver': {
        typescript: {
          project: ['./apps/frontend/tsconfig.eslint.json'],
        },
        node: true,
      },
      react: {
        version: 'detect',
      },
    },
    rules: {
      ...commonTypeScriptRules,
      ...reactRecommended.rules,
      ...reactJsxRuntime.rules,
      ...reactHooksRecommended.rules,
      ...jsxA11yRecommended.rules,
      'jsx-a11y/no-redundant-roles': 'off',
      'jsx-a11y/no-noninteractive-tabindex': 'off',
      'jsx-a11y/no-noninteractive-element-interactions': 'off',
      'jsx-a11y/click-events-have-key-events': 'off',
      'jsx-a11y/role-has-required-aria-props': 'off',
      'react-hooks/rules-of-hooks': 'off',
      'react-hooks/exhaustive-deps': 'off',
      'react/prop-types': 'off',
    },
  },
  {
    files: [
      'apps/backend/src/**/*.spec.js',
      'apps/backend/src/**/*.spec.ts',
      'apps/backend/src/**/*.spec.tsx',
      'apps/backend/src/**/*.test.js',
      'apps/backend/src/**/*.test.ts',
      'apps/backend/src/**/*.test.tsx',
    ],
    languageOptions: {
      globals: {
        ...globals.node,
        ...globals.jest,
      },
    },
  },
  {
    files: [
      'apps/frontend/**/*.spec.js',
      'apps/frontend/**/*.spec.ts',
      'apps/frontend/**/*.spec.tsx',
      'apps/frontend/**/*.test.js',
      'apps/frontend/**/*.test.ts',
      'apps/frontend/**/*.test.tsx',
      'apps/frontend/**/*.config.{js,ts,tsx}',
      'apps/frontend/vite.config.ts',
      'apps/frontend/vitest.config.ts',
      'apps/frontend/vitest.setup.ts',
      'packages/**/*.spec.js',
      'packages/**/*.spec.ts',
      'packages/**/*.spec.tsx',
      'packages/**/*.test.js',
      'packages/**/*.test.ts',
      'packages/**/*.test.tsx',
    ],
    languageOptions: {
      globals: {
        ...globals.node,
        ...globals.browser,
        ...globals.jest,
      },
    },
  },
];
