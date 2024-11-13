<script lang="ts" setup>
import { useSearchResultStore } from '@/stores/searchResult'
import { RelatedQueryOptions } from '@/types/search-results/RelatedQueryOptions'
import { storeToRefs } from 'pinia'
import { computed } from 'vue'
import { extractRelatedSource } from '@/utils/relatedSource.utils'
import RelatedQueryPanel from './RelatedQueryPanel.vue'
import { useParamsStore } from '@/stores/params'
import { useOptionsStore } from '@/stores/options'
import { toggleTermFilter } from '@/utils/filter.toggle.utils'
import { FilterGroupItemTypeTerms } from '@getlupa/client-sdk/Types'

const props = defineProps<{
  options?: RelatedQueryOptions
}>()

const searchResultStore = useSearchResultStore()
const paramsStore = useParamsStore()
const optionsStore = useOptionsStore()

const { searchResult } = storeToRefs(searchResultStore)

const currentSearchText = computed(() => searchResult.value?.searchText ?? '')

const relatedQueries = computed(() => {
  if (!props.options || !searchResult.value) {
    return []
  }
  const queries = extractRelatedSource(props.options.source, searchResult.value)
  return queries
})

const hasEnoughRelatedQueries = computed(() => {
  return relatedQueries.value.length > 1
})

const goToResults = ({ searchText }: { searchText: string }) => {
  paramsStore.goToResults({ searchText })
}

const handleRelatedQueryClick = (query: string) => {
  if (props.options.source?.mode === 'filter') {
    handleFilter(query)
  } else {
    goToResults({ searchText: query })
  }
}

const handleFilter = (query: string) => {
  const facet = searchResult.value?.facets?.find(
    (facet) => facet.key === props.options?.source?.key
  )
  if (!facet || facet.type !== 'terms') {
    return []
  }
  toggleTermFilter(
    paramsStore.appendParams as any,
    { type: 'terms', key: facet.key, value: query },
    optionsStore.getQueryParamName,
    {}
  )
}

const getSelectedFilterClass = (query: string) => {
  if (props.options.source?.mode !== 'filter') {
    return ''
  }
  return Array.isArray(searchResult.value?.filters?.[props.options.source.key]) &&
    (searchResult.value?.filters?.[props.options.source.key] as FilterGroupItemTypeTerms)?.includes(
      query
    )
    ? 'lupa-selected-related-query-filter'
    : ''
}
</script>
<template>
  <div v-if="options && hasEnoughRelatedQueries" class="lupa-related-queries">
    <h3 v-if="options?.labels?.title" class="lupa-related-queries-title">
      {{ options?.labels?.title }}
    </h3>
    <ul>
      <li
        v-for="query of relatedQueries"
        :key="query + currentSearchText"
        :class="getSelectedFilterClass(query)"
      >
        <a @click="handleRelatedQueryClick(query)">
          <RelatedQueryPanel :options="options" :query="query" />
        </a>
      </li>
    </ul>
  </div>
</template>
