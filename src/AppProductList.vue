<script setup lang="ts">
import { computed } from 'vue'
import { merge } from './utils/merger.utils'
import { SEARCH_BOX_CONFIGURATION } from './constants/development/searchBoxDev.const'
import { PRODUCT_LIST_CONFIGURATION } from './constants/development/searchProductListDev.const'
import { SEARCH_RESULTS_CONFIGURATION } from './constants/development/searchResultsDev.const'
import { DEFAULT_SEARCH_BOX_OPTIONS } from './constants/searchBox.const'
import { DEFAULT_OPTIONS_RESULTS } from './constants/searchResults.const'
import type { ProductListOptions } from './types/product-list/ProductListOptions'
import type { SearchBoxOptions } from './types/search-box/SearchBoxOptions'
import type { SearchResultsOptions } from './types/search-results/SearchResultsOptions'
import SearchBox from './components/search-box/SearchBox.vue'
import '../styles/clients/lupa/lupa'
import ProductList from './components/product-list/ProductList.vue'

const fullSearchBoxOptions = computed((): SearchBoxOptions => {
  return merge(DEFAULT_SEARCH_BOX_OPTIONS, SEARCH_BOX_CONFIGURATION as unknown as SearchBoxOptions)
})

const fullSearchResultsOptions = computed((): SearchResultsOptions => {
  return merge(DEFAULT_OPTIONS_RESULTS, SEARCH_RESULTS_CONFIGURATION as unknown as SearchBoxOptions)
})

const fullProductListOptions = computed((): ProductListOptions => {
  return {
    ...fullSearchResultsOptions.value,
    ...PRODUCT_LIST_CONFIGURATION
  } as ProductListOptions
})
</script>

<template>
  <div id="app" class="wrapper">
    <!-- Following icon fonts are available during the plugin development only -->
    <!-- Include your own fonts and icons with your custom theme when deploying your plugin -->
    <link
      href="//db.onlinewebfonts.com/c/68590d1f06ad625cb73b5c34f85b4a1b?family=Luma-Icons"
      rel="stylesheet"
      type="text/css"
    />
    <link
      href="https://cdn.jsdelivr.net/npm/@mdi/font@latest/css/materialdesignicons.min.css"
      rel="stylesheet"
    />
    <div class="box-wrapper">
      <SearchBox :options="fullSearchBoxOptions" />
    </div>
    <div class="result-wrapper">
      <ProductList :options="fullProductListOptions" />
    </div>
  </div>
</template>
