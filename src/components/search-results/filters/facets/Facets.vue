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
import FacetsButton from './FacetsButton.vue'
import { useOptionsStore } from '@/stores/options'
import { RESULT_ROOT_SELECTOR } from '@/constants/global.const'

const props = defineProps<{
  options: ResultFacetOptions
  facetStyle?: FacetStyle
  clearable?: boolean
}>()

const paramStore = useParamsStore()
const searchResultStore = useSearchResultStore()
const optionsStore = useOptionsStore()

const { filters } = storeToRefs(paramStore)
const { facets, loadingFacets } = storeToRefs(searchResultStore)
const { searchResultOptions } = storeToRefs(optionsStore)

const emit = defineEmits(['filter'])

const promotedFacets = computed((): FacetResult[] | undefined => {
  return facets.value?.filter((f) => props.options.promotedFacets?.includes(f.key))
})

const regularFacets = computed((): FacetResult[] | undefined => {
  return facets.value?.filter((f) => !props.options.promotedFacets?.includes(f.key))
})

const scrollToResultsOptions = computed(() => ({
  enabled:
    searchResultOptions.value.scrollToResults?.enabled === undefined
      ? true
      : searchResultOptions.value.scrollToResults?.enabled,
  container:
    searchResultOptions.value.scrollToResults?.scrollToContainerSelector ?? RESULT_ROOT_SELECTOR,
  timeout: searchResultOptions.value.scrollToResults?.timeout ?? 500
}))

const showFilterButton = computed(() => {
  return props.options.filterBehavior === 'withFilterButton'
})

const handleFacetSelect = (facetAction: FacetAction): void => {
  switch (facetAction.type) {
    case 'terms':
      toggleTermFilter(
        paramStore.appendParams as any,
        facetAction,
        optionsStore.getQueryParamName,
        filters.value
      )
      break
    case 'range':
      toggleRangeFilter(
        paramStore.appendParams as any,
        paramStore.removeParameters as any,
        facetAction,
        optionsStore.getQueryParamName,
        filters.value
      )
      break
    case 'hierarchy':
      toggleHierarchyFilter(
        paramStore.appendParams as any,
        facetAction,
        optionsStore.getQueryParamName,
        filters.value
      )
      break
  }
  if (scrollToResultsOptions.value.enabled) {
    scrollToSearchResults(
      scrollToResultsOptions.value.timeout,
      scrollToResultsOptions.value.container
    )
  }
}

const clear = (facet: FacetResult): void => {
  const param = getFacetKey(facet.key, facet.type as FilterType)
  paramStore.removeParameters({ paramsToRemove: [param] })
}

const filter = () => {
  emit('filter')
}
</script>
<template>
  <div
    class="lupa-search-result-facets"
    :class="{ 'lupa-search-result-facets-loading': loadingFacets }"
  >
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
    <div class="lupa-facets-filter-button-wrapper">
      <FacetsButton v-if="showFilterButton" :options="options" @filter="filter" />
    </div>
  </div>
</template>
