<script lang="ts" setup>
import type { SearchResultsOptions } from '@/types/search-results/SearchResultsOptions'
import SearchResultsSummary from './products/SearchResultsSummary.vue'
import { useSearchResultStore } from '@/stores/searchResult'
import { storeToRefs } from 'pinia'
import { computed } from 'vue'
import { addParamsToLabel } from '@/utils/string.utils'

const props = defineProps<{
  options: SearchResultsOptions
  isProductList: boolean
  showSummary?: boolean
}>()

const searchResultStore = useSearchResultStore()
const { currentQueryText, totalItems, searchResult } = storeToRefs(searchResultStore)

const suggestedSearchText = computed(() => searchResult.value.suggestedSearchText)

const queryText = computed((): string => {
  return suggestedSearchText.value || currentQueryText.value
})

const showProductCount = computed((): boolean => {
  return Boolean(props.options.toolbar?.totalCount)
})

const showSearchTitle = computed((): boolean => {
  return Boolean(
    props.options.labels?.searchResults && (currentQueryText.value || props.isProductList)
  )
})

const descriptionTop = computed((): string | undefined => {
  return props.options.categories?.current?.descriptionTop
})

const summaryLabel = computed((): string => {
  return props.options.labels?.itemCount ?? ''
})

const searchResultsCountLabel = computed((): string => {
  return props.options.labels?.searchResultsCount ?? ''
})

const searchResultsTitleTemplate = computed((): string => {
  return props.options?.labels?.searchResults?.includes('{')
    ? addParamsToLabel(props.options?.labels?.searchResults, queryText.value)
    : ``
})
</script>
<template>
  <div>
    <h1 class="lupa-result-page-title" data-cy="lupa-result-page-title" v-if="showSearchTitle">
      {{ searchResultsTitleTemplate || options.labels.searchResults
      }}<span v-if="queryText && !searchResultsTitleTemplate">'{{ queryText }}'</span>
      <span v-if="showProductCount" class="lupa-results-total-count"
        >({{ searchResultsCountLabel
        }}<span class="lupa-results-total-count-number">{{ totalItems }}</span
        >)</span
      >
    </h1>
    <SearchResultsSummary v-if="showSummary" :label="summaryLabel" />
    <div
      class="lupa-result-page-description-top"
      v-if="descriptionTop"
      v-html="descriptionTop"
    ></div>
  </div>
</template>
