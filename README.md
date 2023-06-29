# Quickstart

This is a vue plugin for

For SSR support, see [Plugin for Nuxt 3](https://github.com/lupasearch/lupasearch-nuxt)

For full configuration options see [Main repository](https://github.com/lupasearch/lupasearch-client)

## Quick Setup

1. Add `LupaSearch` dependency to your project

```bash
# Using pnpm
pnpm add -D @getlupa/nuxt @getlupa/vue

# Using yarn
yarn add --dev @getlupa/nuxt @getlupa/vue

# Using npm
npm install --save-dev @getlupa/nuxt @getlupa/vue
```

2. Import desired plugins to your component:

```html
<script setup lang="ts">
  import { SearchBox, SearchBoxOptions, SearchResults, SearchResultsOptions } from '@getlupa/vue'
  import '@getlupa/vue/dist/style.css'

  const searchBoxOptions: SearchBoxOptions = {
    // See main repository for full list of available options
  }

  const searchResultsOptions: SearchResultsOptions = {
    // See main repository for full list of available options
  }
</script>
<template>
  <div class="box-wrapper">
    <SearchBox :options="searchBoxOptions" />
  </div>
  <div class="result-wrapper">
    <SearchResults :options="searchResultsOptions" />
  </div>
</template>
```

See main repo for full configuration options examples.

## Using Slots

```html
<script lang="ts" setup>
  import { SearchBox, SearchBoxOptions, SearchResults, SearchResultsOptions } from '@getlupa/vue'
  import '@getlupa/vue/dist/style.css'

  const searchBoxOptions: SearchBoxOptions = {
    // See main repository for full list of available options
  }

  const searchResultsOptions: SearchResultsOptions = {
    // See main repository for full list of available options
  }
</script>

<template>
  <div>
    <div>
      <LupaSearchBox :options="searchBoxOptions" />
    </div>
    <div style="margin-top: 25px">
      <LupaSearchResults :options="searchResultsOptions">
        <template #productCard="props">
          <div :style="props.style">
            <div style="margin-bottom: 25px">{{ props.product.name }}</div>
          </div>
        </template>
      </LupaSearchResults>
    </div>
  </div>
</template>
```

# Development

This template should help get you started developing with Vue 3 in Vite.

## Recommended IDE Setup

[VSCode](https://code.visualstudio.com/) + [Volar](https://marketplace.visualstudio.com/items?itemName=Vue.volar) (and disable Vetur) + [TypeScript Vue Plugin (Volar)](https://marketplace.visualstudio.com/items?itemName=Vue.vscode-typescript-vue-plugin).

## Type Support for `.vue` Imports in TS

TypeScript cannot handle type information for `.vue` imports by default, so we replace the `tsc` CLI with `vue-tsc` for type checking. In editors, we need [TypeScript Vue Plugin (Volar)](https://marketplace.visualstudio.com/items?itemName=Vue.vscode-typescript-vue-plugin) to make the TypeScript language service aware of `.vue` types.

If the standalone TypeScript plugin doesn't feel fast enough to you, Volar has also implemented a [Take Over Mode](https://github.com/johnsoncodehk/volar/discussions/471#discussioncomment-1361669) that is more performant. You can enable it by the following steps:

1. Disable the built-in TypeScript Extension
   1. Run `Extensions: Show Built-in Extensions` from VSCode's command palette
   2. Find `TypeScript and JavaScript Language Features`, right click and select `Disable (Workspace)`
2. Reload the VSCode window by running `Developer: Reload Window` from the command palette.

## Customize configuration

See [Vite Configuration Reference](https://vitejs.dev/config/).

## Project Setup

```sh
yarn install
```

### Compile and Hot-Reload for Development

```sh
yarn dev
```

### Type-Check, Compile and Minify for Production

```sh
yarn build
```

### Lint with [ESLint](https://eslint.org/)

```sh
yarn lint
```
