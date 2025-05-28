<script lang="ts" setup>
import { useSearchResultStore } from '@/stores/searchResult'
import { RelatedQueryOptions } from '@/types/search-results/RelatedQueryOptions'
import { storeToRefs } from 'pinia'
import { computed } from 'vue'
import { useParamsStore } from '@/stores/params'
import { useOptionsStore } from '@/stores/options'
import { toggleTermFilter } from '@/utils/filter.toggle.utils'
import type { FilterGroupItemTypeTerms, RelatedQuery } from '@getlupa/client-sdk/Types'
import RelatedQueryPanelApi from './RelatedQueryPanelApi.vue'

defineProps<{
  options?: RelatedQueryOptions
}>()

const searchResultStore = useSearchResultStore()
const paramsStore = useParamsStore()
const optionsStore = useOptionsStore()

const { searchResult, relatedQueriesResult } = storeToRefs(searchResultStore)

const relatedQueries = computed((): RelatedQuery[] => {
  return relatedQueriesResult.value?.relatedQueries ?? []
})

const currentSearchText = computed(() => searchResult.value?.searchText ?? '')

const hasEnoughRelatedQueries = computed(() => {
  return relatedQueries.value?.length > 1
})

const handleRelatedQueryClick = (relatedQuery: RelatedQuery) => {
  if (relatedQuery.action === 'FILTER') {
    handleFilter({ key: relatedQuery.facetKey, value: relatedQuery.filterValue })
  } else {
    paramsStore.goToResults({ searchText: relatedQuery.query })
  }
}

const handleFilter = (query: { key: string; value: string }) => {
  toggleTermFilter(
    paramsStore.appendParams as any,
    { type: 'terms', key: query.key, value: query.value },
    optionsStore.getQueryParamName,
    {},
    relatedQueries.value?.map((q) => `f.${q.facetKey}`)
  )
}

const getSelectedFilterClass = (relatedQuery: RelatedQuery) => {
  if (relatedQuery.action !== 'FILTER') {
    return ''
  }
  return Array.isArray(searchResult.value?.filters?.[relatedQuery.facetKey]) &&
    (searchResult.value?.filters?.[relatedQuery.facetKey] as FilterGroupItemTypeTerms)?.includes(
      relatedQuery.filterValue
    )
    ? 'lupa-selected-related-query-filter'
    : ''
}
</script>
<template>
  <div v-if="hasEnoughRelatedQueries" class="lupa-related-queries">
    <h3 v-if="options?.labels?.title" class="lupa-related-queries-title">
      {{ options?.labels?.title }}
    </h3>
    <ul>
      <li
        v-for="query of relatedQueries"
        :key="query.query + query.facetKey + query.filterValue + currentSearchText"
        :class="getSelectedFilterClass(query)"
      >
        <a @click="handleRelatedQueryClick(query)">
          <RelatedQueryPanelApi :relatedQuery="query" :options="options" />
        </a>
      </li>
    </ul>
  </div>
</template>
