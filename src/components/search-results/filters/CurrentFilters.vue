<script lang="ts" setup>
import { FACET_PARAMS_TYPE, QUERY_PARAMS } from '@/constants/queryParams.const'
import { useParamsStore } from '@/stores/params'
import { useSearchResultStore } from '@/stores/searchResult'
import type { LabeledFilter } from '@/types/search-results/Filters'
import type { ResultCurrentFilterOptions } from '@/types/search-results/SearchResultsOptions'
import { toggleHierarchyFilter, toggleTermFilter } from '@/utils/filter.toggle.utils'
import { storeToRefs } from 'pinia'
import { computed, ref } from 'vue'
import CurrentFilterDisplay from './CurrentFilterDisplay.vue'

defineProps<{
  options?: ResultCurrentFilterOptions
  expandable: boolean
}>()

const isOpen = ref(false)

const paramsStore = useParamsStore()
const searchResultStore = useSearchResultStore()

const { filters, displayFilters, currentFilterCount } = storeToRefs(searchResultStore)

const currentFilters = computed(() => filters.value)

const hasFilters = computed((): boolean => displayFilters.value?.length > 0)

const handleClearAll = (): void => {
  paramsStore.removeAllFilters()
}

const handleRemove = ({ filter }: { filter: LabeledFilter }): void => {
  switch (filter.type) {
    case 'terms':
      toggleTermFilter(
        // TODO: Fix any
        paramsStore.appendParams as any,
        { type: 'terms', value: filter.value, key: filter.key },
        currentFilters.value
      )
      break
    case 'hierarchy':
      toggleHierarchyFilter(
        paramsStore.appendParams as any,
        { type: 'hierarchy', value: filter.value, key: filter.key },
        currentFilters.value,
        true
      )
      break
    case 'range':
      paramsStore.removeParameters({
        paramsToRemove: [QUERY_PARAMS.PAGE, `${FACET_PARAMS_TYPE.RANGE}${filter.key}`]
      })
      break
  }
}
</script>
<template>
  <div
    class="lupa-search-result-current-filters"
    :class="{ expandable: expandable }"
    data-cy="lupa-search-result-current-filters"
    v-if="hasFilters"
  >
    <div class="lupa-current-filter-title" @click="isOpen = !isOpen">
      <div class="lupa-filter-title-text">
        {{ options?.labels?.title ?? '' }}
        <span class="lupa-filter-count" v-if="expandable"> ({{ currentFilterCount }}) </span>
      </div>
      <div v-if="expandable" class="lupa-filter-title-caret" :class="isOpen && 'open'"></div>
    </div>
    <div class="filter-values" v-if="!expandable || isOpen">
      <div class="lupa-current-filter-list">
        <CurrentFilterDisplay
          v-for="filter of displayFilters"
          :key="filter.key + '_' + filter.value"
          :filter="filter"
          @remove="handleRemove"
        />
      </div>
      <div class="lupa-clear-all-filters" data-cy="lupa-clear-all-filters" @click="handleClearAll">
        {{ options?.labels?.clearAll ?? '' }}
      </div>
    </div>
  </div>
</template>
