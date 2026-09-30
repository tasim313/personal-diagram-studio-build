import { createRequire } from 'module'
import { fileURLToPath } from 'url'

const require = createRequire(fileURLToPath(import.meta.url))

const js = require('@eslint/js')
const tseslint = require('typescript-eslint')

/** @type {import('eslint').Linter.Config[]} */
const config = tseslint.config(
  js.configs.recommended,
  ...tseslint.configs.recommended,
  {
    files: ['**/*.ts', '**/*.tsx'],
    rules: {
      'no-console': ['warn', { allow: ['warn', 'error', 'info'] }],
      '@typescript-eslint/no-unused-vars': ['error', { argsIgnorePattern: '^_', varsIgnorePattern: '^_' }],
      '@typescript-eslint/no-explicit-any': 'warn',
    },
  },
  {
    ignores: ['node_modules/**', '.next/**', 'scripts/**'],
  }
)

export default config
