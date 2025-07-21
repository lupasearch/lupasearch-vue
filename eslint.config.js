// import "@rushstack/eslint-patch/eslint-bulk-suppressions.js"
import pluginVue from 'eslint-plugin-vue';
import js from '@eslint/js';
import skipFormatting from '@vue/eslint-config-prettier/skip-formatting';
import {
  defineConfigWithVueTs,
  vueTsConfigs,
} from '@vue/eslint-config-typescript'

export default defineConfigWithVueTs(
  {
    ignores: ["node_modules", "dist"],
  },
  pluginVue.configs['flat/recommended'],
  js.configs.recommended,
  vueTsConfigs.recommended,
  skipFormatting,
  {
    files: ["**/*.{js,cjs,mjs,ts,cts,mts,jsx,tsx,vue}"],
    languageOptions: {
      parserOptions: {
        ecmaVersion: 'latest',
      },
    },
    rules: {
      'vue/require-default-prop': 'off',
      'vue/require-prop-types': 'off',
      '@typescript-eslint/no-unused-vars': 'off',
      '@typescript-eslint/no-unused-expressions': 'off',
      '@typescript-eslint/no-explicit-any': 'off',
    },
    plugins: {
      vue: pluginVue,
    },
  },
)