<script lang="ts" setup>
import { useParamsStore } from '@/stores/params'
import { useSearchResultStore } from '@/stores/searchResult'
import type { FacetAction } from '@/types/search-results/FacetAction'
import type { FilterType } from '@/types/search-results/Filters'
import type { FacetStyle, ResultFacetOptions } from '@/types/search-results/SearchResultsOptions'
import {
  toggleTermFilter,
  toggleRangeFilter,
  toggleHierarchyFilter,
  getFacetKey
} from '@/utils/filter.toggle.utils'
import { scrollToSearchResults } from '@/utils/scroll.utils'
import type { FacetResult } from '@getlupa/client-sdk/Types'
import { storeToRefs } from 'pinia'
import { computed } from 'vue'
import FacetList from './FacetList.vue'

const props = defineProps<{
  options: ResultFacetOptions
  facetStyle?: FacetStyle
  clearable?: boolean
}>()

const paramStore = useParamsStore()
const searchResultStore = useSearchResultStore()

const { filters } = storeToRefs(paramStore)
const { facets } = storeToRefs(searchResultStore)

const promotedFacets = computed((): FacetResult[] | undefined => {
  return facets.value?.filter((f) => props.options.promotedFacets?.includes(f.key))
})

const regularFacets = computed((): FacetResult[] | undefined => {
  return facets.value?.filter((f) => !props.options.promotedFacets?.includes(f.key))
})

const handleFacetSelect = (facetAction: FacetAction): void => {
  switch (facetAction.type) {
    case 'terms':
      toggleTermFilter(paramStore.appendParams as any, facetAction, filters.value)
      break
    case 'range':
      toggleRangeFilter(paramStore.appendParams as any, facetAction, filters.value)
      break
    case 'hierarchy':
      toggleHierarchyFilter(paramStore.appendParams as any, facetAction, filters.value)
      break
  }
  scrollToSearchResults()
}

const clear = (facet: FacetResult): void => {
  const param = getFacetKey(facet.key, facet.type as FilterType)
  paramStore.removeParameters({ paramsToRemove: [param] })
}
</script>
<template>
  <div class="lupa-search-result-facets">
    <FacetList
      v-if="regularFacets"
      :options="options"
      :facets="regularFacets"
      :currentFilters="filters"
      :facetStyle="facetStyle"
      :clearable="clearable"
      @select="handleFacetSelect"
      @clear="clear"
    />
  </div>
</template>
