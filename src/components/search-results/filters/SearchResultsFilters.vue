<script lang="ts" setup>
import type { SearchResultsFilterOptions } from '@/types/search-results/SearchResultsOptions'
import { computed, ref } from 'vue'
import CurrentFilters from './CurrentFilters.vue'
import CategoryFilter from '@/components/product-list/CategoryFilter.vue'
import Facets from './facets/Facets.vue'

const categoryFilters = ref(null)

const props = defineProps<{ options: SearchResultsFilterOptions; expandable?: boolean }>()

const desktopFiltersVisible = computed((): boolean => {
  // Default is true
  return props.options.currentFilters?.visibility?.desktopSidebar ?? true
})

const currentFiltersVisible = computed((): boolean => {
  return props.options.currentFilters?.visibility?.mobileSidebar || desktopFiltersVisible.value
})

const showCurrentFilters = computed((): boolean => {
  return currentFiltersVisible.value ? Boolean(props.options.facets) : false
})

const fetch = () => {
  if (categoryFilters.value) {
    ;(categoryFilters.value as any)?.fetch()
  }
}

defineExpose({ fetch })
</script>

<template>
  <div id="lupa-search-result-filters" class="lupa-search-result-filters">
    <CurrentFilters
      v-if="showCurrentFilters"
      :options="options.currentFilters"
      :expandable="expandable ?? false"
    />
    <CategoryFilter v-if="options.categories" :options="options.categories" ref="categoryFilters" />
    <Facets v-if="options.facets" :options="options.facets" />
  </div>
</template>
