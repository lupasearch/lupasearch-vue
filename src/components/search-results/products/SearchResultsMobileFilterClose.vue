<script lang="ts" setup>
import { useSearchResultStore } from '@/stores/searchResult'

defineProps<{
  label: string
}>()

const searchResultStore = useSearchResultStore()

const handleMobileToggle = (): void => {
  searchResultStore.setSidebarState({
    visible: false
  })
}
</script>

<template>
  <div class="lupa-mobile-filter-close-toggle" @click="handleMobileToggle">
    {{ label }}
  </div>
</template>
