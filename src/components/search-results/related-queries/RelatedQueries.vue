<script lang="ts" setup>
import { useSearchResultStore } from '@/stores/searchResult'
import { RelatedQueryOptions } from '@/types/search-results/RelatedQueryOptions'
import { storeToRefs } from 'pinia'
import { computed, Ref, ref, watch } from 'vue'
import { extractRelatedSource } from '@/utils/relatedSource.utils'
import RelatedQueryPanel from './RelatedQueryPanel.vue'
import { useParamsStore } from '@/stores/params'
import { useOptionsStore } from '@/stores/options'
import { toggleTermFilter } from '@/utils/filter.toggle.utils'
import { FilterGroup, FilterGroupItemTypeTerms, Document } from '@getlupa/client-sdk/Types'

const props = defineProps<{
  options?: RelatedQueryOptions
}>()

const searchResultStore = useSearchResultStore()
const paramsStore = useParamsStore()
const optionsStore = useOptionsStore()

const { searchResult } = storeToRefs(searchResultStore)
const { searchResultOptions } = storeToRefs(optionsStore)

const relatedQueries: Ref<{ key: string; value: string }[]> = ref([])

const allDisplayItems = ref<Record<string, Document>>({})
const querySourceResultMap = ref<Record<string, boolean>>({})

const currentSearchText = computed(() => searchResult.value?.searchText ?? '')

const currentFilters = computed(() => paramsStore.filters)

const querySources = computed(() => {
  return props.options?.source?.queries?.map((q) => q.facetKey) ?? []
})

const currentFiltersWithoutQuerySources = computed(() => {
  const filters: FilterGroup = {}
  if (currentFilters.value) {
    for (const key in currentFilters.value) {
      if (!querySources.value.includes(key)) {
        filters[key] = currentFilters.value[key]
      }
    }
  }
  return filters
})

watch(searchResult, async () => {
  allDisplayItems.value = {}
  querySourceResultMap.value = {}
  if (!props.options || !searchResult.value) {
    relatedQueries.value = []
  }
  const queries = await extractRelatedSource(
    props.options.source,
    searchResult.value,
    searchResultOptions.value.options,
    currentFiltersWithoutQuerySources.value
  )
  relatedQueries.value = queries
})

const hasEnoughRelatedQueries = computed(() => {
  return relatedQueries.value?.length > 1
})

const handleRelatedQueryClick = (query: { key: string; value: string }) => {
  if (props.options.source?.mode === 'filter') {
    handleFilter(query)
  } else {
    paramsStore.goToResults({ searchText: query.value })
  }
}

const handleFilter = (query: { key: string; value: string }) => {
  toggleTermFilter(
    paramsStore.appendParams as any,
    { type: 'terms', key: query.key, value: query.value },
    optionsStore.getQueryParamName,
    {},
    querySources.value?.map((q) => `f.${q}`)
  )
}

const getSelectedFilterClass = (query: { key: string; value: string }) => {
  if (props.options.source?.mode !== 'filter') {
    return ''
  }
  return Array.isArray(searchResult.value?.filters?.[query.key]) &&
    (searchResult.value?.filters?.[query.key] as FilterGroupItemTypeTerms)?.includes(query.value)
    ? 'lupa-selected-related-query-filter'
    : ''
}

const processLoadedItem = (query: { key: string; value: string }, item: Document) => {
  if(item){
    allDisplayItems.value[`${item.id}`] = item
  }
  querySourceResultMap.value[query.value] = Boolean(item)
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
        :key="query.value + query.key + currentSearchText"
        :class="getSelectedFilterClass(query)"
        v-show="querySourceResultMap[query.value] !== false"
      >
        <a @click="handleRelatedQueryClick(query)">
          <RelatedQueryPanel
            :source-key="query.key"
            :options="options"
            :query="query.value"
            :existing-items-from-other-queries="allDisplayItems"
            @loaded="(item) => processLoadedItem(query, item)"
          />
        </a>
      </li>
    </ul>
  </div>
</template>
