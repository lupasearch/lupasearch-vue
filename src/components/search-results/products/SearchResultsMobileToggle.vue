<script lang="ts" setup>
import { useSearchResultStore } from '@/stores/searchResult'
import { storeToRefs } from 'pinia'

defineProps<{
  label: string
  showFilterCount: boolean
}>()

const searchResultStore = useSearchResultStore()
const { currentFilterCount } = storeToRefs(searchResultStore)

const handleMobileToggle = (): void => {
  searchResultStore.setSidebarState({ visible: true })
}
</script>

<template>
  <div
    class="lupa-mobile-toggle"
    @click="handleMobileToggle"
    :class="{ 'lupa-mobile-toggle-filters-empty': currentFilterCount < 1 }"
  >
    {{ label }}
    <span
      class="lupa-mobile-toggle-filter-count"
      v-if="showFilterCount && currentFilterCount > 0"
      >{{ currentFilterCount }}</span
    >
  </div>
</template>
