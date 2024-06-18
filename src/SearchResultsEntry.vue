<script lang="ts" setup>
import { cloneDeep, merge } from 'lodash'
import { type Ref, ref, computed } from 'vue'
import type { SearchResultsOptions } from '.'
import { DEFAULT_OPTIONS_RESULTS } from './constants/searchResults.const'
import SearchResults from './components/search-results/SearchResults.vue'
import { useSearchResultStore } from './stores/searchResult'

const props = defineProps<{
  searchResultsOptions: SearchResultsOptions
}>()

const searchResultsStore = useSearchResultStore()
const searchResults: Ref<null | any> = ref(null)

const fullSearchResultsOptions = computed((): SearchResultsOptions => {
  const options = cloneDeep(props.searchResultsOptions)
  return merge(DEFAULT_OPTIONS_RESULTS, options)
})

const fetch = (): void => {
  console.log(props.searchResultsOptions.hideResultsOnReload);
  if (props.searchResultsOptions.hideResultsOnReload) {
    searchResultsStore.clearSearchResult()
    searchResultsStore.setLoading(true)
  }
  searchResults.value?.handleUrlChange()
}

defineExpose({ fetch })
</script>

<template>
  <SearchResults :options="fullSearchResultsOptions" ref="searchResults" />
</template>
