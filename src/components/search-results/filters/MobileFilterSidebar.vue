<script lang="ts" setup>
import type { SearchResultsFilterOptions } from '@/types/search-results/SearchResultsOptions'
import SearchResultsFilters from './SearchResultsFilters.vue'
import { useSearchResultStore } from '@/stores/searchResult'
import { storeToRefs } from 'pinia'
import { computed } from 'vue'

const props = defineProps<{ options: SearchResultsFilterOptions }>()

const searchResultStore = useSearchResultStore()

const { currentFilterCount } = storeToRefs(searchResultStore)

const emit = defineEmits(['filter'])

const sidebarTitle = computed((): string => {
  return props.options.facets?.labels?.title ?? ''
})

const isFilterCountVisible = computed((): boolean => {
  return (
    Boolean(props.options.currentFilters?.mobileSidebar?.showFilterCount) &&
    currentFilterCount.value > 0
  )
})

const isMobileSidebarVisible = computed(() => searchResultStore.isMobileSidebarVisible)

const isActiveFiltersExpanded = computed((): boolean => {
  return !props.options.currentFilters?.mobileSidebar?.activeFiltersExpanded
})

const handleMobileToggle = (): void => {
  searchResultStore.setSidebarState({ visible: false })
}

const filter = () => {
  emit('filter')
  handleMobileToggle()
}
</script>

<template>
  <div class="lupa-mobile-filter-sidebar" v-if="isMobileSidebarVisible">
    <div class="lupa-sidebar-close" @click.stop="handleMobileToggle"></div>
    <div class="lupa-mobile-sidebar-content">
      <div class="lupa-sidebar-top">
        <div class="lupa-sidebar-title">
          {{ sidebarTitle }}
          <span v-if="isFilterCountVisible" class="lupa-sidebar-filter-count">{{
            currentFilterCount
          }}</span>
        </div>
        <div class="lupa-filter-toggle-mobile" @click="handleMobileToggle"></div>
      </div>
      <div class="lupa-sidebar-filter-options">
        <SearchResultsFilters
          :options="options"
          :expandable="isActiveFiltersExpanded"
          @filter="filter"
        />
      </div>
    </div>
  </div>
</template>
