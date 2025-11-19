<script lang="ts" setup>
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
    class="lupa-mobile-toggle"
    @click="handleFilterSidebarToggle"
    :class="{
      'lupa-mobile-toggle-filters-empty': currentFilterCount < 1,
      'lupa-mobile-toggle-has-filters': hasActiveFilters,
      'lupa-sidebar-open': isSidebarVisible
    }"
  >
    {{ label }}
    <span
      class="lupa-mobile-toggle-filter-count"
      v-if="showMobileFilterCount && currentFilterCount > 0"
      >{{ currentFilterCount }}</span
    >
  </div>
</template>
