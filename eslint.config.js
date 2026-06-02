'use strict'

const js = require('@eslint/js')

module.exports = [
  /** Ignore generated/data directories that contain no source to lint */
  {
    ignores: ['.volumes/**', 'node_modules/**']
  },

  /** Base rules applied to every JS file in the project */
  js.configs.recommended,
  {
    languageOptions: {
      ecmaVersion: 'latest',
      sourceType: 'commonjs',
      globals: {
        require: 'readonly',
        module: 'readonly',
        exports: 'readonly',
        process: 'readonly',
        console: 'readonly',
        __dirname: 'readonly',
        __filename: 'readonly'
      }
    },
    rules: {
      indent: ['error', 2],
      quotes: ['error', 'single'],
      semi: ['error', 'never'],
      'no-unused-vars': 'warn',
      'no-console': 'off'
    }
  },

  /** Browser globals for front-end scripts served from public/js/ */
  {
    files: ['public/js/**/*.js'],
    languageOptions: {
      globals: {
        document: 'readonly',
        window: 'readonly',
        localStorage: 'readonly',
        fetch: 'readonly',
        navigator: 'readonly',
        location: 'readonly'
      }
    }
  },

  /** Service worker globals — self and caches are not available in normal browser scope */
  {
    files: ['public/sw.js'],
    languageOptions: {
      globals: {
        self: 'readonly',
        caches: 'readonly',
        fetch: 'readonly'
      }
    }
  },

  /** Jest globals for test files */
  {
    files: ['tests/**/*.js'],
    languageOptions: {
      globals: {
        jest: 'readonly',
        describe: 'readonly',
        it: 'readonly',
        expect: 'readonly',
        beforeEach: 'readonly',
        afterEach: 'readonly',
        beforeAll: 'readonly',
        afterAll: 'readonly'
      }
    }
  }
]
