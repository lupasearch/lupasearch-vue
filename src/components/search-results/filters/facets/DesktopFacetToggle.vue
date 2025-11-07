<script lang="ts" setup>
import { SearchResultsOptionLabels } from '@/types/search-results/SearchResultsOptions'
import { useSidebarToggle } from '@/composables/useSidebarToggle'

const {
  isSidebarVisible,
  label,
  currentFilterCount,
  hasActiveFilters,
  showMobileFilterCount,
  handleFilterSidebarToggle
} = useSidebarToggle()
</script>

<template>
  <div
    class="lupa-desktop-toggle"
    @click="handleFilterSidebarToggle"
    :class="{
      'lupa-desktop-toggle-filters-empty': currentFilterCount < 1,
      'lupa-desktop-toggle-has-filters': hasActiveFilters,
      'lupa-sidebar-open': isSidebarVisible
    }"
  >
    {{ label }}
    <span
      v-if="showMobileFilterCount && currentFilterCount > 0"
      class="lupa-desktop-toggle-filter-count"
      >{{ currentFilterCount }}</span
    >
  </div>
</template>
