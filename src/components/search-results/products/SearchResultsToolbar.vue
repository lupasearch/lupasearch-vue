<script lang="ts" setup>
import type { SearchResultsOptions } from '@/types/search-results/SearchResultsOptions'
import SearchResultsLayoutSelection from './SearchResultsLayoutSelection.vue'
import SearchResultsMobileToggle from './SearchResultsMobileToggle.vue'
import SearchResultsSummary from './SearchResultsSummary.vue'
import SearchResultsPageSelect from './pagination/SearchResultsPageSelect.vue'
import SearchResultsPageSize from './pagination/SearchResultsPageSize.vue'
import SearchResultsSort from './sort/SearchResultsSort.vue'
import { computed } from 'vue'
import { useSearchResultStore } from '@/stores/searchResult'
import { storeToRefs } from 'pinia'
import { useParamsStore } from '@/stores/params'
import type { SortOptions } from '@/types/search-results/SearchResultsSort'
import type { PaginationDisplay, PaginationOptions } from '@/types/search-results/PaginationOptions'
import { useOptionsStore } from '@/stores/options'
import { getPageCount } from '@/utils/picker.utils'

const props = defineProps<{
  options: SearchResultsOptions
  paginationLocation: 'top' | 'bottom'
}>()

const optionsValue = computed(() => props.options ?? ({ labels: {} } as SearchResultsOptions))

const paramStore = useParamsStore()
const searchResultStore = useSearchResultStore()
const optionsStore = useOptionsStore()

const { page, limit } = storeToRefs(paramStore)
const { hasAnyFilter, searchResult } = storeToRefs(searchResultStore)
const { currentResolutionPageSizes } = storeToRefs(optionsStore)

const isBottomLocation = computed((): boolean => {
  return props.paginationLocation === 'bottom'
})

const showFilterClear = computed((): boolean => {
  return isBottomLocation.value ? false : Boolean(optionsValue.value.toolbar?.clearFilters)
})

const showItemSummary = computed((): boolean => {
  return isBottomLocation.value ? false : Boolean(optionsValue.value.toolbar?.itemSummary)
})

const showLayoutSelection = computed((): boolean => {
  return isBottomLocation.value ? false : Boolean(optionsValue.value.toolbar?.layoutSelector)
})

const sortOptions = computed((): SortOptions | undefined => {
  if (isBottomLocation.value || !optionsValue.value.sort?.length) {
    return undefined
  }
  return {
    label: optionsValue.value.labels.sortBy,
    options: optionsValue.value.sort ?? []
  }
})

const paginationDisplay = computed((): PaginationDisplay => {
  if (props.paginationLocation === 'top') {
    return {
      pageSize: optionsValue.value.pagination.sizeSelection.position.top,
      pageSelect: optionsValue.value.pagination.pageSelection.position.top
    }
  } else {
    return {
      pageSize: optionsValue.value.pagination.sizeSelection.position.bottom,
      pageSelect: optionsValue.value.pagination.pageSelection.position.bottom
    }
  }
})

const paginationOptions = computed((): PaginationOptions => {
  const pageSelect = optionsValue.value.pagination.pageSelection
  return {
    pageSize: {
      sizes: currentResolutionPageSizes.value,
      selectedSize: limit.value
    },
    pageSelect: {
      count: getPageCount(searchResult.value.total, limit.value),
      selectedPage: page.value,
      display: pageSelect.display,
      displayMobile: pageSelect.displayMobile
    },
    labels: optionsValue.value.labels
  }
})

const displayPageSelect = computed((): boolean => {
  return paginationDisplay.value.pageSelect && paginationOptions.value.pageSelect.count > 0
})

const searchSummaryLabel = computed((): string => {
  const defaultLabel = paginationOptions.value?.labels?.itemCount ?? ''
  return !hasAnyFilter.value || !showFilterClear.value
    ? defaultLabel
    : paginationOptions.value?.labels?.filteredItemCount ?? defaultLabel
})

const toolbarLeftLabel = computed((): string => {
  return optionsValue.value.labels.toolbarLeftLabel ?? ''
})

const toolbarRightLabel = computed((): string => {
  return optionsValue.value.labels.toolbarRightLabel ?? ''
})

const showMobileFilterCount = computed((): boolean => {
  return Boolean(optionsValue.value.filters?.currentFilters?.mobileSidebar?.showFilterCount)
})

const hasResults = computed((): boolean => {
  return searchResult.value.total > 0
})

const callbacks = computed(() => props.options.callbacks ?? {})

const handleClearAll = (): void => {
  paramStore.removeAllFilters()
}
</script>

<template>
  <div id="lupa-search-results-toolbar" :class="{ 'lupa-filter-no-results': !hasResults }">
    <div class="lupa-toolbar-left">
      <div v-if="toolbarLeftLabel" class="lupa-toolbar-right-title">
        {{ toolbarLeftLabel }}
      </div>
      <SearchResultsLayoutSelection v-if="showLayoutSelection" />
      <div v-else></div>

      <SearchResultsSummary
        v-if="showItemSummary"
        :label="searchSummaryLabel"
        :clearable="hasAnyFilter && showFilterClear"
        @clear="handleClearAll"
      />
      <div v-else></div>

      <SearchResultsPageSelect
        :options="paginationOptions.pageSelect"
        :last-page-label="paginationOptions.labels.showMore"
        :first-page-label="paginationOptions.labels.showLess"
        v-if="displayPageSelect"
      />
      <div v-else></div>
    </div>
    <div class="lupa-toolbar-right">
      <div v-if="toolbarRightLabel" class="lupa-toolbar-right-title">
        {{ toolbarRightLabel }}
      </div>
      <SearchResultsMobileToggle
        :label="optionsValue.labels.mobileFilterButton"
        :show-filter-count="showMobileFilterCount"
      />
      <SearchResultsPageSize
        v-if="paginationDisplay.pageSize"
        :options="paginationOptions.pageSize"
        :labels="paginationOptions.labels"
      />
      <div v-else></div>
      <SearchResultsSort v-if="sortOptions" :options="sortOptions" :callbacks="callbacks" />
      <div v-else></div>
    </div>
  </div>
</template>
