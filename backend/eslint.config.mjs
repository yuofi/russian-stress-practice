import { defineConfig } from "eslint/config";
import path from 'path';
import tsParser from '@typescript-eslint/parser';
import tsPlugin from '@typescript-eslint/eslint-plugin';
import importPlugin from 'eslint-plugin-import';

export default defineConfig([{
    files: ['**/*.ts', '**/*.tsx', '**/*.js'],
    ignores: ['jest.config.js'],
    plugins: {
        '@typescript-eslint': tsPlugin,
        'import': importPlugin
      },
    languageOptions: {
        ecmaVersion: 5,
        sourceType: "script",
        parser: tsParser,
        parserOptions: {
            project: "./tsconfig.json",
        },
    },

    settings: {
        "import/resolver": {
            node: {
                extensions: [".js", ".ts", ".tsx"],
            },
        },
    },

    rules: {
        "no-console": "error",

        "no-restricted-imports": ["error", {
        patterns: [{
          group: [
            path.join(process.cwd(), "src/test/**"),
            `!${path.join(process.cwd(), "src/**/*.integration.test.ts")}`
          ],
          message: "Import from test dir is only allowed in integration test files",
        }]
      }],

      "import/order": ["error", {
            groups: ["builtin", "external", "parent", "sibling", "index"],

            pathGroups: [{
                pattern: "{.,..}/**/env\n",
                group: "builtin",
                position: "before",
            }, {
                pattern: "{.,..}/**/test/integration\n",
                group: "builtin",
                position: "before",
            }],

            alphabetize: {
                order: "asc",
                caseInsensitive: false,
                orderImportKind: "asc",
            },
        }],
    },
}]);