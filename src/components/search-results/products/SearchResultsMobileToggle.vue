<script lang="ts" setup>
import { storeToRefs } from 'pinia'
import { computed } from 'vue'
import { useOptionsStore } from '@/stores/options'
import { useSearchResultStore } from '@/stores/searchResult'
import { SearchResultsOptionLabels } from '@/types/search-results/SearchResultsOptions'

const props = defineProps<{
  labels: SearchResultsOptionLabels
  showFilterCount: boolean
}>()

const searchResultStore = useSearchResultStore()
const optionsStore = useOptionsStore()
const { currentFilterCount, isMobileSidebarVisible } = storeToRefs(searchResultStore)
const { searchResultOptions } = storeToRefs(optionsStore)

const disableMobileBodyScrollLock = computed(
  () => searchResultOptions.value.filters?.facets?.disableMobileBodyScrollLock ?? false
)
const isSidebarVisible = computed(() => isMobileSidebarVisible.value)

const defaultLabel = computed(() => props.labels.mobileFilterButton)

const activeLabel = computed(() => props.labels.mobileFilterButtonActive)

const openLabel = computed(() => props.labels.mobileFilterButtonOpen)

const label = computed(() => {
  if (isSidebarVisible.value && openLabel.value) {
    return openLabel.value
  }
  if (hasActiveFilters.value && activeLabel.value) {
    return activeLabel.value
  }
  return defaultLabel.value
})

const handleMobileToggle = (): void => {
  searchResultStore.setSidebarState({
    visible: !isSidebarVisible.value,
    disableBodyScrolling: !disableMobileBodyScrollLock.value
  })
}

const hasActiveFilters = computed(() => currentFilterCount.value > 0)
</script>

<template>
  <div
    class="lupa-mobile-toggle"
    @click="handleMobileToggle"
    :class="{
      'lupa-mobile-toggle-filters-empty': currentFilterCount < 1,
      'lupa-mobile-toggle-has-filters': hasActiveFilters,
      'lupa-sidebar-open': isSidebarVisible
    }"
  >
    {{ label }}
    <span
      class="lupa-mobile-toggle-filter-count"
      v-if="showFilterCount && currentFilterCount > 0"
      >{{ currentFilterCount }}</span
    >
  </div>
</template>
