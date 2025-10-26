import js from '@eslint/js';
import prettier from 'eslint-config-prettier';
import react from 'eslint-plugin-react';
import reactHooks from 'eslint-plugin-react-hooks';
import globals from 'globals';
import typescript from 'typescript-eslint';

/** @type {import('eslint').Linter.FlatConfig[]} */
export default [
  // Base JavaScript rules
  js.configs.recommended,

  // TypeScript rules
  ...typescript.configs.recommended,

  // React & JSX support
  {
    ...react.configs.flat.recommended,
    ...react.configs.flat['jsx-runtime'],
    languageOptions: {
      globals: {
        ...globals.browser,
      },
    },
    rules: {
      'react/react-in-jsx-scope': 'off',
      'react/prop-types': 'off',
      'react/no-unescaped-entities': 'off',
    },
    settings: {
      react: {
        version: 'detect',
      },
    },
  },

  // React Hooks rules
  {
    plugins: {
      'react-hooks': reactHooks,
    },
    rules: {
      'react-hooks/rules-of-hooks': 'error',
      'react-hooks/exhaustive-deps': 'warn',
    },
  },

  // Unused variables suppression
  {
    rules: {
      // Turn off the base rule (handled by TS plugin)
      'no-unused-vars': 'off',
      '@typescript-eslint/no-unused-vars': [
        'warn',
        {
          vars: 'all',
          args: 'after-used',
          ignoreRestSiblings: true,
          argsIgnorePattern: '^_',
          varsIgnorePattern: '^_',
        },
      ],
    },
  },

  // Ignore specific folders
  {
    ignores: [
      'vendor',
      'node_modules',
      'public',
      'bootstrap/ssr',
      'tailwind.config.js',
    ],
  },

  // Prettier support (disable rules that conflict)
  prettier,
];