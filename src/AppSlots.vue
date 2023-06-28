<script setup lang="ts">
import { computed } from 'vue'
import { merge } from './utils/merger.utils'
import { SEARCH_BOX_CONFIGURATION } from './constants/development/searchBoxDev.const'
import { SEARCH_RESULTS_CONFIGURATION } from './constants/development/searchResultsDev.const'
import { DEFAULT_SEARCH_BOX_OPTIONS } from './constants/searchBox.const'
import { DEFAULT_OPTIONS_RESULTS } from './constants/searchResults.const'
import type { SearchBoxOptions } from './types/search-box/SearchBoxOptions'
import type { SearchResultsOptions } from './types/search-results/SearchResultsOptions'
import SearchBox from './components/search-box/SearchBox.vue'
import SearchResults from './components/search-results/SearchResults.vue'
import '../styles/clients/lupa/lupa'

const fullSearchBoxOptions = computed((): SearchBoxOptions => {
  return merge(DEFAULT_SEARCH_BOX_OPTIONS, SEARCH_BOX_CONFIGURATION as unknown as SearchBoxOptions)
})

const fullSearchResultsOptions = computed((): SearchResultsOptions => {
  return merge(DEFAULT_OPTIONS_RESULTS, SEARCH_RESULTS_CONFIGURATION as unknown as SearchBoxOptions)
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
      <SearchBox :options="fullSearchBoxOptions">
        <template #productCard="props">
          <div>
            {{ props.item.name }}
          </div>
        </template>
      </SearchBox>
    </div>
    <div class="result-wrapper">
      <SearchResults :options="fullSearchResultsOptions">
        <template #productCard="props">
          <div :style="props.style">hi</div>
        </template>
      </SearchResults>
    </div>
  </div>
</template>
<style lang="scss">
#app {
  height: auto;
  display: flex;
  flex-direction: column;
}

.wrapper {
  margin: 10px;
}

.box-wrapper {
  width: 50%;
  margin: 20px auto;
  @media (max-width: 752px) {
    width: 95%;
    margin: 10px auto;
  }
}

.result-wrapper,
.list-wrapper {
  box-sizing: border-box;
  margin-left: auto;
  margin-right: auto;
  padding-left: 24px;
  padding-right: 24px;
  width: 100%;
}

.recommendations-wrapper {
  display: flex;
}
</style>
