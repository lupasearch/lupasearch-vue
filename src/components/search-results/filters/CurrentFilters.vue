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
import { useOptionsStore } from '@/stores/options'
import { getNormalizedString } from '@/utils/string.utils'

defineProps<{
  options?: ResultCurrentFilterOptions
  expandable: boolean
}>()

const optionsStore = useOptionsStore()
const { searchResultOptions } = storeToRefs(optionsStore)
const units = computed(
  () => searchResultOptions.value.filters.facets.stats.units ?? {}
)

const isOpen = ref(false)

const paramsStore = useParamsStore()
const optionStore = useOptionsStore()
const searchResultStore = useSearchResultStore()

const {
  filters,
  displayFilters,
  currentFilterCount,
  hideFiltersOnExactMatchForKeys,
  currentQueryText
} = storeToRefs(searchResultStore)

const currentFilters = computed(() => filters.value)

const currentDisplayFilters = computed(() =>
  hideFiltersOnExactMatchForKeys.value.length
    ? displayFilters.value.filter((f) => {
        return (
          !hideFiltersOnExactMatchForKeys.value?.includes(f.key) ||
          getNormalizedString(currentQueryText.value) !== getNormalizedString(f.value)
        )
      })
    : displayFilters.value
)

const hasFilters = computed((): boolean => currentDisplayFilters.value?.length > 0)

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
        optionStore.getQueryParamName,
        currentFilters.value
      )
      break
    case 'hierarchy':
      toggleHierarchyFilter(
        paramsStore.appendParams as any,
        { type: 'hierarchy', value: filter.value, key: filter.key },
        optionStore.getQueryParamName,
        currentFilters.value,
        true
      )
      break
    case 'range':
      paramsStore.removeParameters({
        paramsToRemove: [
          optionStore.getQueryParamName(QUERY_PARAMS.PAGE),
          `${FACET_PARAMS_TYPE.RANGE}${filter.key}`
        ]
      })
      break
  }
}

function formatFilterValue(filter: LabeledFilter): string {
  const unit = units.value[filter.key] || ''
  let min: string | undefined
  let max: string | undefined

  if (Array.isArray(filter.value)) {
    [min, max] = filter.value.map(String)
  }
  else if (typeof filter.value === 'string' && filter.value.includes('-')) {
    const parts = filter.value.split('-').map(s => s.trim())
    if (parts.length === 2) {
      [min, max] = parts
    }
  }

  if (min != null && max != null) {
    return `${min} ${unit} – ${max} ${unit}`.trim()
  }

  return `${filter.value} ${unit}`.trim()
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
        <div
          v-for="filter of currentDisplayFilters"
          :key="filter.key + '_' + filter.value"
          class="lupa-current-filter-tag"
        >
      {{ filter.label }}:
      <span>{{ formatFilterValue(filter) }}</span>

  <button @click="handleRemove({ filter })">×</button>
</div>

      </div>
      <div class="lupa-clear-all-filters" data-cy="lupa-clear-all-filters" @click="handleClearAll">
        {{ options?.labels?.clearAll ?? '' }}
      </div>
    </div>
  </div>
</template>
