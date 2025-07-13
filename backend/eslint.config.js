import js from '@eslint/js';
import globals from 'globals';

export default [
  js.configs.recommended,
  {
    languageOptions: {
      ecmaVersion: 2022,
      sourceType: 'module',
      globals: {
        ...globals.node,
        ...globals.es2022
      }
    },
    rules: {
      'no-unused-vars': 'error',
      'no-console': 'warn',
      'prefer-const': 'error',
      'no-var': 'error',
      'object-shorthand': 'error',
      'prefer-template': 'error',
      'no-trailing-spaces': 'error',
      'eol-last': 'error',
      'no-multiple-empty-lines': ['error', { max: 2 }],
      'quotes': ['error', 'single'],
      'semi': ['error', 'always'],
      'comma-dangle': ['error', 'never'],
      'indent': ['error', 2],
      'space-before-function-paren': ['error', 'always'],
      'arrow-spacing': 'error',
      'no-duplicate-imports': 'error',
      'no-unreachable': 'error',
      'no-constant-condition': 'error',
      'no-empty': 'error',
      'no-extra-semi': 'error',
      'no-irregular-whitespace': 'error',
      'no-multi-spaces': 'error',
      'no-redeclare': 'error',
      'no-undef': 'error',
      'no-unreachable': 'error',
      'no-unused-expressions': 'error',
      'no-useless-return': 'error',
      'prefer-arrow-callback': 'error',
      'require-await': 'error',
      'valid-typeof': 'error'
    }
  },
  {
    ignores: [
      'node_modules/**',
      'dist/**',
      'build/**',
      'coverage/**',
      '*.min.js'
    ]
  }
]; 