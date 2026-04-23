import pluginJs from '@eslint/js';
import globals from 'globals';
import tseslint from 'typescript-eslint';

import eslintPluginPrettierRecommended from 'eslint-plugin-prettier/recommended';

/** @type {import('eslint').Linter.Config[]} */
export default [
  { files: ['**/*.{js,mjs,cjs,ts}'] },
  { languageOptions: { globals: globals.browser } },
  {
    parser: '@typescript-eslint/parser',
    parserOptions: {
      ecmaVersion: 'latest',
      sourceType: 'module',
    },
    plugins: ['@typescript-eslint'],
    rules: {
      eqeqeq: 'off',
      'prefer-const': ['error', { ignoreReadBeforeAssign: true }],
      'no-unused-vars': 'warn',
      'no-unused-expressions': 'error',
      'prefer-const': 'warn',
      'no-console': 'warn',
      'no-undef': 'error',
    },
  },
  eslintPluginPrettierRecommended,
  pluginJs.configs.recommended,
  ...tseslint.configs.recommended,
  {
    ignores: ['.node_modules/*'],
  },
  {
    globals: {
      process: 'readonly',
    },
  },
];
