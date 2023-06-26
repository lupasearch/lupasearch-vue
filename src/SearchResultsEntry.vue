<script lang="ts" setup>
import { cloneDeep, merge } from 'lodash'
import { type Ref, ref, computed } from 'vue'
import type { SearchBoxOptions, SearchResultsOptions } from '.'
import { DEFAULT_OPTIONS_RESULTS } from './constants/searchResults.const'
import SearchResults from './components/search-results/SearchResults.vue'

const props = defineProps<{
  searchResultsOptions: SearchBoxOptions
}>()

const searchResults: Ref<null | any> = ref(null)

const fullSearchResultsOptions = computed((): SearchResultsOptions => {
  const options = cloneDeep(props.searchResultsOptions)
  return merge(DEFAULT_OPTIONS_RESULTS, options)
})

const fetch = (): void => {
  searchResults.value?.handleUrlChange()
}

defineExpose({ fetch })
</script>

<template>
  <SearchResults :options="fullSearchResultsOptions" ref="searchResults" />
</template>
