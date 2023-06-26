<script setup lang="ts">
import { computed, onMounted } from 'vue'
import { merge } from './utils/merger.utils'
import { SEARCH_BOX_CONFIGURATION } from './constants/development/searchBoxDev.const'
import { SEARCH_RESULTS_CONFIGURATION } from './constants/development/searchResultsDev.const'
import { DEFAULT_SEARCH_BOX_OPTIONS } from './constants/searchBox.const'
import { DEFAULT_OPTIONS_RESULTS } from './constants/searchResults.const'
import type { SearchBoxOptions } from './types/search-box/SearchBoxOptions'
import type { SearchResultsOptions } from './types/search-results/SearchResultsOptions'
import '../styles/clients/lupa/lupa'
import type { SearchContainerOptions } from './types/search-container/SearchContainerOptions'
import lupaSearch from '.'

const fullSearchBoxOptions = computed((): SearchBoxOptions => {
  return merge(DEFAULT_SEARCH_BOX_OPTIONS, SEARCH_BOX_CONFIGURATION as unknown as SearchBoxOptions)
})

const fullSearchResultsOptions = computed((): SearchResultsOptions => {
  return merge(DEFAULT_OPTIONS_RESULTS, SEARCH_RESULTS_CONFIGURATION as unknown as SearchBoxOptions)
})

const containerOptions = computed((): SearchContainerOptions => {
  return {
    trigger: '.trigger',
    searchBox: fullSearchBoxOptions.value,
    searchResults: fullSearchResultsOptions.value
  }
})

onMounted(() => {
  lupaSearch.searchContainer(containerOptions.value)
  console.log(containerOptions.value)
  // setTimeout(() => {
  //   lupaSearch.searchContainer({
  //     ...containerOptions.value,
  //     searchBox: {
  //       ...containerOptions.value.searchBox,
  //       labels: {
  //         ...containerOptions.value.searchBox.labels,
  //         placeholder: 'Updated'
  //       }
  //     },
  //     searchResults: {
  //       ...containerOptions.value.searchResults,
  //       labels: {
  //         ...containerOptions.value.searchResults.labels,
  //         pageSize: 'Atnaujintas psl dydis'
  //       }
  //     }
  //   })
  // }, 5000)
})
</script>

<template>
  <div id="app" class="wrapper">
    <div>
      <input type="text" class="trigger" placeholder="Click me to search!" />
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
  // max-width: 1050px;
  padding-left: 24px;
  padding-right: 24px;
  width: 100%;
}

.recommendations-wrapper {
  display: flex;
}
</style>
