import js from '@eslint/js'
import globals from 'globals'
import reactHooks from 'eslint-plugin-react-hooks'
import reactRefresh from 'eslint-plugin-react-refresh'
import tseslint from 'typescript-eslint'
import prettier from 'eslint-config-prettier'
import { defineConfig, globalIgnores } from 'eslint/config'

// Numbers that are universally unambiguous and therefore exempt from the
// no-magic-numbers rule. Everything else must be a named constant.
const ALLOWED_LITERAL_NUMBERS = [-1, 0, 1]

export default defineConfig([
  globalIgnores([
    'dist',
    'node_modules',
    'src/puzzles/generated.ts',
    'coverage',
  ]),
  {
    files: ['**/*.{ts,tsx}'],
    extends: [
      js.configs.recommended,
      // Strictest type-aware rule sets from typescript-eslint.
      tseslint.configs.strictTypeChecked,
      tseslint.configs.stylisticTypeChecked,
      reactHooks.configs.flat.recommended,
      reactRefresh.configs.vite,
    ],
    languageOptions: {
      globals: globals.browser,
      parserOptions: {
        // Enable type-aware linting across the whole project.
        projectService: true,
        tsconfigRootDir: import.meta.dirname,
      },
    },
    rules: {
      // No magic numbers — force named constants everywhere.
      '@typescript-eslint/no-magic-numbers': [
        'error',
        {
          ignore: ALLOWED_LITERAL_NUMBERS,
          ignoreEnums: true,
          ignoreReadonlyClassProperties: true,
          ignoreTypeIndexes: true,
          ignoreArrayIndexes: false,
          enforceConst: true,
          detectObjects: false,
        },
      ],
      // Ban `any` and unsafe escapes from the type system.
      '@typescript-eslint/no-explicit-any': 'error',
      '@typescript-eslint/no-non-null-assertion': 'error',
      // Prefer immutability and explicit intent.
      'prefer-const': 'error',
      'no-var': 'error',
      eqeqeq: ['error', 'always'],
      // Consistent, explicit type imports.
      '@typescript-eslint/consistent-type-imports': [
        'error',
        { prefer: 'type-imports', fixStyle: 'inline-type-imports' },
      ],
    },
  },
  // Config/build files run in Node and aren't part of the app type graph.
  {
    files: ['*.{js,ts}', 'vite.config.ts'],
    languageOptions: { globals: globals.node },
  },
  // The constants module is the one place where raw numbers are *defined* and
  // given names, so the no-magic-numbers rule does not apply to it.
  {
    files: ['src/config/constants.ts'],
    rules: { '@typescript-eslint/no-magic-numbers': 'off' },
  },
  // Tests legitimately use literal fixtures, non-null assertions on known data,
  // and loosely-typed mocks. Relax those rules for test files only.
  {
    files: ['**/*.test.{ts,tsx}', 'src/test/**/*.{ts,tsx}'],
    rules: {
      '@typescript-eslint/no-magic-numbers': 'off',
      '@typescript-eslint/no-non-null-assertion': 'off',
      '@typescript-eslint/no-unsafe-assignment': 'off',
      '@typescript-eslint/no-unsafe-member-access': 'off',
      '@typescript-eslint/no-unsafe-call': 'off',
      '@typescript-eslint/no-unsafe-argument': 'off',
      '@typescript-eslint/no-unsafe-return': 'off',
      '@typescript-eslint/no-empty-function': 'off',
      // Vitest's documented mock pattern uses `importOriginal<typeof import(...)>`.
      '@typescript-eslint/consistent-type-imports': 'off',
    },
  },
  // Disable stylistic rules that Prettier owns. Must come last.
  prettier,
])
