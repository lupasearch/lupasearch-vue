<script lang="ts" setup>
import type { SearchResultsOptions } from '@/types/search-results/SearchResultsOptions'
import SearchResultsSummary from './products/SearchResultsSummary.vue'
import { useSearchResultStore } from '@/stores/searchResult'
import { storeToRefs } from 'pinia'
import { computed } from 'vue'
import { addParamsToLabel } from '@/utils/string.utils'
import LoadingBlock from '../common/skeleton/LoadingBlock.vue'
import { useLoadingSkeleton } from '@/composables/useLoadingSkeleton'
import { useParamsStore } from '@/stores/params'

const props = defineProps<{
  options: SearchResultsOptions
  isProductList: boolean
  showSummary?: boolean
}>()

const searchResultStore = useSearchResultStore()
const paramsStore = useParamsStore()
const { currentQueryText, totalItems, searchResult } = storeToRefs(searchResultStore)
const { skeletonEnabled, loading } = useLoadingSkeleton()
const { query } = storeToRefs(paramsStore)

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
    <LoadingBlock
      type="text"
      :count="1"
      :enabled="skeletonEnabled && Boolean(query)"
      :loading="loading"
    >
      <h1 v-if="showSearchTitle" class="lupa-result-page-title" data-cy="lupa-result-page-title">
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
        v-if="descriptionTop"
        class="lupa-result-page-description-top"
        v-html="descriptionTop"
      ></div>
    </LoadingBlock>
  </div>
</template>
