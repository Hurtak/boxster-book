import { defineConfig, mergeConfig } from 'vite-plus';
import { buildBook } from './scripts/build';
import { bookDevelopmentConfig } from './scripts/mdx/development';

const config = defineConfig({
  run: { cache: { scripts: false, tasks: false } },
  builder: {
    async buildApp(builder) {
      await buildBook();
      // buildBook runs the SSR and browser environments with the book's asset
      // registry. Tell Vite that the client is built so it does not also look
      // for a conventional root index.html.
      builder.environments.client.isBuilt = true;
    },
  },
  fmt: {
    singleQuote: true,
    printWidth: 120,
    ignorePatterns: [
      'dist/**',
      '.agents/**',
      'AGENTS.md',
      'assets/**',
      'book/**/*.mdx',
      'book/**/research.md',
      'book/**/images/**',
      'book/**/part-reference/**',
      'book/**/diagrams/**/*.svg',
      'package-lock.json',
    ],
  },
  lint: {
    ignorePatterns: ['dist/**'],
    plugins: ['typescript', 'react', 'oxc'],
    jsPlugins: [{ name: 'vite-plus', specifier: 'vite-plus/oxlint-plugin' }],
    rules: {
      'vite-plus/prefer-vite-plus-imports': 'error',
      'no-unused-vars': ['error', { argsIgnorePattern: '^_', varsIgnorePattern: '^_' }],
      'no-debugger': 'error',
      'typescript/no-explicit-any': 'error',
      eqeqeq: 'error',
    },
    options: { typeAware: true, typeCheck: true },
  },
  test: {
    include: ['tests/**/*.test.ts'],
    environment: 'node',
    reporters: ['verbose'],
    fileParallelism: false,
    testTimeout: 120_000,
    hookTimeout: 120_000,
  },
});

export default defineConfig(async ({ command, mode, isPreview }) => {
  if (command === 'serve' && mode !== 'test' && !isPreview) {
    return mergeConfig(config, await bookDevelopmentConfig());
  }
  return config;
});
