<script lang="ts" setup>
import { storeToRefs } from 'pinia'
import { computed } from 'vue'
import { useOptionsStore } from '@/stores/options'
import { useSearchResultStore } from '@/stores/searchResult'

defineProps<{
  label: string
  showFilterCount: boolean
}>()

const searchResultStore = useSearchResultStore()
const optionsStore = useOptionsStore()
const { currentFilterCount } = storeToRefs(searchResultStore)
const { searchResultOptions } = storeToRefs(optionsStore)

const disableMobileBodyScrollLock = computed(
  () => searchResultOptions.value.filters?.facets?.disableMobileBodyScrollLock ?? false
)

const handleMobileToggle = (): void => {
  searchResultStore.setSidebarState({
    visible: true,
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
      'lupa-mobile-toggle-has-filters': hasActiveFilters
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
