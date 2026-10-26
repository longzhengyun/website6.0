import js from '@eslint/js';
import astro from 'eslint-plugin-astro';
import tseslint from 'typescript-eslint';
import globals from 'globals';

// P-4 质量门禁（初宽后紧口径）：只启用 recommended 级规则；
// 存量修复独立 commit；.astro 的 frontmatter/<script>/<style> 由 astro 解析器覆盖。
export default [
  {
    ignores: [
      'dist/**',
      'node_modules/**',
      '.astro/**', // astro check/build 生成物
      'src/data/news.types.d.ts', // json-schema-to-typescript 生成物
      'src/data/news.json',
      'src/data/news.seed.json',
      'src/data/news-stats.json',
    ],
  },
  js.configs.recommended,
  ...tseslint.configs.recommended,
  ...astro.configs.recommended,
  {
    languageOptions: {
      globals: { ...globals.browser, ...globals.node },
    },
    rules: {
      // 初宽档：以下规则先降 warn，二期后段再收紧为 error
      'no-console': 'off',
      '@typescript-eslint/no-explicit-any': 'warn',
      '@typescript-eslint/ban-ts-comment': 'warn',
      // 约定 _ 前缀 = 有意弃置的解构/回调位（如 pipeline 剥离内部字段 __new: _n）
      '@typescript-eslint/no-unused-vars': [
        'error',
        { args: 'after-used', argsIgnorePattern: '^_', varsIgnorePattern: '^_', caughtErrors: 'none' },
      ],
    },
  },
];
